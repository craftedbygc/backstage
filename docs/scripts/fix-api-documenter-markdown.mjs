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
  'theatre-core.md',
  'theatre-studio.md',
  'theatre-threejs.md',
])

export function fixApiDocumenterMarkdownFiles(outputDir) {
  for (const entry of fs.readdirSync(outputDir, {withFileTypes: true})) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    if (!PACKAGE_INDEX_FILES.has(entry.name)) continue
    const filePath = path.join(outputDir, entry.name)
    const original = fs.readFileSync(filePath, 'utf8')
    const fixed = fixApiDocumenterMarkdown(original)
    if (fixed !== original) {
      fs.writeFileSync(filePath, fixed)
      console.log(`  fixed markdown tables in ${entry.name}`)
    }
  }
}
