import { Fragment } from 'react'
import type { CSSProperties } from 'react'

/**
 * Splits a heading into `.word` spans (numbered with --w) so CSS can reveal it
 * word by word; see `.reveal .word` in global.css. Screen readers still get
 * the plain sentence, because the spaces stay text nodes between the spans.
 */
export function Words({ text }: { text: string }) {
  return text.split(' ').map((word, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      <span className="word" style={{ '--w': i } as CSSProperties}>
        {word}
      </span>
    </Fragment>
  ))
}
