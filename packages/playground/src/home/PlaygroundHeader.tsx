import React from 'react'
import styled from 'styled-components'

const PlaygroundHeaderContainer = styled.div`
  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;

  padding: 1rem;

  /* White/White8 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`
const PlaygroundHeaderVersion = styled.div`
  padding: 6px 16px;

  background: rgba(34, 103, 99, 0.38);
  border-radius: 30px;

  font-family: 'Source Code Pro', 'Monaco', monospace;
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 17px;

  /* Teal/Teal300 */
  color: #64c4bf;
`

const HeaderGroup = styled.div`
  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 12px;
`

const HeaderLink = styled.a`
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 1;

  text-decoration: none;
  display: inline-flex;
  padding: 0.5rem;

  /* identical to box height, or 169% */

  /* White/White100 */
  color: #ffffff;

  transition: color 0.2s ease-in;

  &:hover,
  &:focus {
    /* Teal/Teal300 */
    color: #64c4bf;
  }
`

const BackstageLogo = styled.p`
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 1;
  margin: 0;
`

export function PlaygroundHeader(props: {
  version?: {
    displayText: string
    linkHref?: string
  }
  links: {
    label: string
    href: string
  }[]
}) {
  return (
    <PlaygroundHeaderContainer>
      <HeaderGroup>
        <BackstageLogo>Backstage.js</BackstageLogo>
        {props.version && (
          <PlaygroundHeaderVersion>
            {props.version.displayText}
          </PlaygroundHeaderVersion>
        )}
      </HeaderGroup>
      <HeaderGroup>
        {props.links.map((link) => (
          <HeaderLink href={link.href} key={link.label} role="button">
            {link.label}
          </HeaderLink>
        ))}
      </HeaderGroup>
    </PlaygroundHeaderContainer>
  )
}
