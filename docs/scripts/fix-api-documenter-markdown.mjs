/**
 * api-documenter emits package index tables where long TSDoc (with ``` fences)
 * spans multiple lines inside a table cell. GFM / VitePress require one row per
 * line, so fences break out of the table and corrupt the rest of the page.
 *
 * This pass collapses those rows to a one-line summary that links to the member page.
 */
import fs from 'node:fs'
import path from 'node:path'

function stripHtmlTags(html) {
  return html.replace(/<[^>]+>/g, '')
}

/**
 * Package index tables should not embed code samples (api-documenter puts fenced
 * blocks in cells). Link to the member page for examples instead.
 */
function summarizeTableCellDescription(rawDescription) {
  const withoutFences = rawDescription.replace(/```[\s\S]*?```/g, ' ')
  const firstParagraph =
    withoutFences.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? withoutFences
  let text = stripHtmlTags(firstParagraph)
    .replace(/\\([\[\]])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length > 240) {
    text = `${text.slice(0, 237)}…`
  }
  return `${text} See the linked page for examples and full documentation.`
}

function isTableRowStart(line) {
  return /^\|  \[[^\]]+\]\([^)]+\) \|/.test(line)
}

/** First column + pipe present, but row does not end with a closing table pipe. */
function isIncompleteTableRow(line) {
  const normalized = line.replace(/\r$/, '')
  if (!isTableRowStart(normalized)) return false
  return !normalized.trimEnd().endsWith('|')
}

/**
 * @param {string[]} lines
 * @returns {{ fixed: string, nextIndex: number }}
 */
function collapseIncompleteTableRow(lines, startIndex) {
  const cellLines = [lines[startIndex]]
  let i = startIndex + 1

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '|') {
      i++
      break
    }
    if (isTableRowStart(line) && line.trimEnd().endsWith('|')) {
      break
    }
    cellLines.push(line)
    if (line.trimEnd().endsWith('|') && cellLines.length > 1) {
      i++
      break
    }
    i++
  }

  const first = cellLines[0].replace(/\r$/, '')
  const linkMatch = first.match(/^(\|  \[[^\]]+\]\([^)]+\) \|)([\s\S]*)$/)
  if (!linkMatch) {
    return {fixed: cellLines.join('\n'), nextIndex: i}
  }

  const prefix = linkMatch[1]
  const tailParts = [linkMatch[2], ...cellLines.slice(1)]
  let description = tailParts.join('\n').trimEnd()
  if (description.endsWith('|')) {
    description = description.slice(0, -1).trimEnd()
  }

  description = summarizeTableCellDescription(description)
  const fixed = `${prefix} ${description.trim()} |`

  return {fixed, nextIndex: i}
}

export function fixApiDocumenterMarkdown(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0

  while (i < lines.length) {
    if (isIncompleteTableRow(lines[i])) {
      const {fixed, nextIndex} = collapseIncompleteTableRow(lines, i)
      out.push(fixed)
      i = nextIndex
    } else {
      out.push(lines[i])
      i++
    }
  }

  return out.join('\n')
}

const PACKAGE_INDEX_FILES = new Set([
  'backstage-core.md',
  'backstage-studio.md',
  'backstage-threejs.md',
  'backstage-gsap.md',
])

/**
 * api-documenter parameter tables put raw TS object types in cells, e.g.
 * `{ foo?: number }`. VitePress/Vue treat `<number>` as HTML ("Duplicate attribute").
 * Wrap type cells that contain angle brackets in backticks.
 */
function fixParameterTableTypeCells(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let inParameters = false

  for (const line of lines) {
    if (line.trim() === '## Parameters') {
      inParameters = true
      out.push(line)
      continue
    }
    if (inParameters && line.startsWith('## ')) {
      inParameters = false
    }
    if (
      inParameters &&
      line.startsWith('|') &&
      !line.includes('---') &&
      (line.includes('<') || /\|\s*\{/.test(line))
    ) {
      const parts = line.split('|')
      if (parts.length >= 4) {
        const typeCell = parts[2]
        const trimmed = typeCell.trim()
        if (
          trimmed &&
          !trimmed.startsWith('`') &&
          (trimmed.includes('<') ||
            trimmed.includes('>') ||
            trimmed.startsWith('{'))
        ) {
          parts[2] = ` \`${trimmed.replace(/`/g, '\\`')}\` `
          out.push(parts.join('|'))
          continue
        }
      }
    }
    out.push(line)
  }

  return out.join('\n')
}

/** Standalone return-type lines after `<b>Returns:</b>` confuse the Vue MD compiler. */
function fixReturnsTypeLines(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (
      i > 0 &&
      lines[i - 1].trim() === '<b>Returns:</b>' &&
      line.trim() &&
      !line.trim().startsWith('`') &&
      !line.trim().startsWith('|') &&
      (line.includes('<') || line.includes('&lt;'))
    ) {
      const decoded = line
        .trim()
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
      out.push(`\`${decoded}\``)
      continue
    }
    out.push(line)
  }
  return out.join('\n')
}

export function fixApiDocumenterMarkdownFiles(outputDir) {
  for (const entry of fs.readdirSync(outputDir, {withFileTypes: true})) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    const filePath = path.join(outputDir, entry.name)
    let content = fs.readFileSync(filePath, 'utf8')
    let next = content

    if (PACKAGE_INDEX_FILES.has(entry.name)) {
      next = fixApiDocumenterMarkdown(next)
    }
    next = fixParameterTableTypeCells(next)
    next = fixReturnsTypeLines(next)

    if (next !== content) {
      fs.writeFileSync(filePath, next)
      console.log(`  fixed markdown in ${entry.name}`)
    }
  }

  injectApiDocumenterNamespaceSummaries(outputDir)
}

/** TSDoc on `export { types }` re-exports does not reach the api-extractor namespace node. */
const NAMESPACE_PAGE_SUMMARIES = {
  'backstage-core.types.md':
    'Prop type factories (`number`, `rgba`, `compound`, etc.) for `sheet.object()` prop definitions.',
}

function injectApiDocumenterNamespaceSummaries(outputDir) {
  for (const [fileName, summary] of Object.entries(NAMESPACE_PAGE_SUMMARIES)) {
    const filePath = path.join(outputDir, fileName)
    if (!fs.existsSync(filePath)) continue
    let content = fs.readFileSync(filePath, 'utf8')
    const heading = '## types namespace'
    if (content.includes(heading) && !content.includes(summary)) {
      content = content.replace(
        new RegExp(`${heading}\r?\n\r?\n`),
        `${heading}\n\n${summary}\n\n`,
      )
      fs.writeFileSync(filePath, content)
      console.log(`  injected namespace summary in ${fileName}`)
    }
  }

  const coreIndexPath = path.join(outputDir, 'backstage-core.md')
  if (!fs.existsSync(coreIndexPath)) return
  let coreIndex = fs.readFileSync(coreIndexPath, 'utf8')
  const typesSummary = NAMESPACE_PAGE_SUMMARIES['backstage-core.types.md']
  const emptyTypesRow = '|  [types](./backstage-core.types.md) |  |'
  const filledTypesRow = `|  [types](./backstage-core.types.md) | ${typesSummary} |`
  if (coreIndex.includes(emptyTypesRow)) {
    coreIndex = coreIndex.replace(emptyTypesRow, filledTypesRow)
    fs.writeFileSync(coreIndexPath, coreIndex)
    console.log('  injected types namespace summary in backstage-core.md')
  }
}
