import React from 'react'
import styled from 'styled-components'

export const ItemSectionWithPreviews = (props: {
  groupName: string
  modules: string[]
  collapsedByDefault: boolean
  collapsible: boolean
}) => {
  const {groupName, modules, collapsedByDefault, collapsible} = props

  const [collapsed, setCollapsed] = React.useState(
    collapsible && collapsedByDefault,
  )

  const toggleCollapse = () => {
    if (!collapsible) return
    setCollapsed(!collapsed)
  }

  return (
    <section>
      <SectionHeader collapsible={collapsible} onClick={toggleCollapse}>
        {groupName}
      </SectionHeader>

      {!collapsed && (
        <ItemListContainer>
          {modules.map((moduleName) => {
            const href = `${
              (import.meta as ImportMeta & {env?: {BASE_URL?: string}}).env
                ?.BASE_URL ?? '/'
            }${groupName}/${moduleName}/`
            return (
              <ItemContainer key={`li-${moduleName}`}>
                <ItemLink href={href}>
                  <ItemDesc>
                    <h3>{moduleName}</h3>
                  </ItemDesc>
                </ItemLink>
              </ItemContainer>
            )
          })}
        </ItemListContainer>
      )}
    </section>
  )
}

const SectionHeader = styled.h3<{collapsible: boolean}>`
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;

  text-transform: capitalize;

  /* White/White50 */
  color: rgba(255, 255, 255, 0.5);

  text-decoration: ${({collapsible}) => (collapsible ? 'underline' : 'none')};
  cursor: ${({collapsible}) => (collapsible ? 'pointer' : 'default')};
  user-select: none;
`

const ItemDesc = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 12px;
  gap: 4px;

  & > h3 {
    margin: 0;

    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 18px;

    /* White/White80 */
    color: rgba(255, 255, 255, 0.8);
  }

  & > p {
    margin: 0;
    font-weight: 400;
    font-size: 13px;
    line-height: 16px;
    /* identical to box height, or 123% */
    /* White/White60 */
    color: rgba(255, 255, 255, 0.6);
  }
`

const ItemContainer = styled.div`
  /* display: inline-flex; */
`

const ItemListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;

  margin-bottom: 2rem;
`

const ItemLink = styled.a`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  text-decoration: none;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  &:hover {
    border-color: rgba(255, 255, 255, 0.16);
    background-color: rgba(255, 255, 255, 0.04);
  }
`
