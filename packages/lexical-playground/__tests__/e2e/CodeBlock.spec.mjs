/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  moveLeft,
  moveToEditorBeginning,
  moveToEnd,
  moveToStart,
  selectAll,
  selectCharacters,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  assertSelection,
  click,
  expect,
  focusEditor,
  html,
  initialize,
  test,
} from '../utils/index.mjs';

async function toggleCodeBlock(page) {
  await click(page, '.block-controls');
  await click(page, '.dropdown .icon.code');
}

test.describe('CodeBlock', () => {
  test.beforeEach(({isCollab, page}) => initialize({isCollab, page}));
  test('Can create code block with markdown', async ({page, isRichText}) => {
    await focusEditor(page);
    await page.keyboard.type('``` alert(1);');
    if (isRichText) {
      await assertSelection(page, {
        anchorOffset: 1,
        anchorPath: [0, 4, 0],
        focusOffset: 1,
        focusPath: [0, 4, 0],
      });
      await assertHTML(
        page,
        html`
          <code
            class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
            dir="ltr"
            spellcheck="false"
            data-gutter="1"
            data-highlight-language="javascript"
            data-language="javascript">
            <span
              class="PlaygroundEditorTheme__tokenFunction"
              data-lexical-text="true">
              alert
            </span>
            <span
              class="PlaygroundEditorTheme__tokenPunctuation"
              data-lexical-text="true">
              (
            </span>
            <span
              class="PlaygroundEditorTheme__tokenProperty"
              data-lexical-text="true">
              1
            </span>
            <span
              class="PlaygroundEditorTheme__tokenPunctuation"
              data-lexical-text="true">
              )
            </span>
            <span
              class="PlaygroundEditorTheme__tokenPunctuation"
              data-lexical-text="true">
              ;
            </span>
          </code>
        `,
      );

      // Remove code block (back to a normal paragraph) and check that highlights are converted into regular text
      await moveToEditorBeginning(page);
      await page.keyboard.press('Backspace');
      await assertHTML(
        page,
        html`
          <p
            class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
            dir="ltr">
            <span data-lexical-text="true">alert(1);</span>
          </p>
        `,
      );
    } else {
      await assertHTML(
        page,
        html`
          <p
            class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
            dir="ltr">
            <span data-lexical-text="true">\`\`\` alert(1);</span>
          </p>
        `,
      );
    }
  });

  test('Can create code block with markdown and wrap existing text', async ({
    page,
    isRichText,
  }) => {
    await focusEditor(page);
    await page.keyboard.type('alert(1);');
    await moveToEditorBeginning(page);
    await page.keyboard.type('``` ');
    if (isRichText) {
      await assertSelection(page, {
        anchorOffset: 0,
        anchorPath: [0, 0, 0],
        focusOffset: 0,
        focusPath: [0, 0, 0],
      });
      await assertHTML(
        page,
        html`
          <code
            class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
            dir="ltr"
            spellcheck="false"
            data-gutter="1"
            data-highlight-language="javascript"
            data-language="javascript">
            <span
              class="PlaygroundEditorTheme__tokenFunction"
              data-lexical-text="true">
              alert
            </span>
            <span
              class="PlaygroundEditorTheme__tokenPunctuation"
              data-lexical-text="true">
              (
            </span>
            <span
              class="PlaygroundEditorTheme__tokenProperty"
              data-lexical-text="true">
              1
            </span>
            <span
              class="PlaygroundEditorTheme__tokenPunctuation"
              data-lexical-text="true">
              )
            </span>
            <span
              class="PlaygroundEditorTheme__tokenPunctuation"
              data-lexical-text="true">
              ;
            </span>
          </code>
        `,
      );
    } else {
      await assertHTML(
        page,
        html`
          <p
            class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
            dir="ltr">
            <span data-lexical-text="true">\`\`\` alert(1);</span>
          </p>
        `,
      );
    }
  });

  test('Can select multiple paragraphs and convert to code block', async ({
    page,
    isPlainText,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page);
    await page.keyboard.type('foo');
    await page.keyboard.press('Enter');
    await page.keyboard.type('bar');
    await page.keyboard.press('Enter');
    await page.keyboard.type('yar');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('meh');

    await selectAll(page);

    await assertHTML(
      page,
      html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">foo</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">bar</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">yar</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph"><br /></p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">meh</span>
        </p>
      `,
    );

    await toggleCodeBlock(page);

    await assertHTML(
      page,
      html`
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="12345"
          data-highlight-language="javascript"
          data-language="javascript">
          <span data-lexical-text="true">foo</span>
          <br />
          <span data-lexical-text="true">bar</span>
          <br />
          <span data-lexical-text="true">yar</span>
          <br />
          <br />
          <span data-lexical-text="true">meh</span>
        </code>
      `,
    );
  });

  test('Can select partial paragraphs and convert to code block', async ({
    page,
    isPlainText,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page);
    await page.keyboard.type('foo');
    await page.keyboard.press('Enter');
    await page.keyboard.type('bar');
    await page.keyboard.press('Enter');
    await page.keyboard.type('yar');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('meh');
    await page.keyboard.down('Shift');
    await moveLeft(page, 10);
    await page.keyboard.up('Shift');

    await assertHTML(
      page,
      html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">foo</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">bar</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">yar</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph"><br /></p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">meh</span>
        </p>
      `,
    );

    await toggleCodeBlock(page);

    await assertHTML(
      page,
      html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">foo</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">ba</span>
        </p>
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="1234"
          data-highlight-language="javascript"
          data-language="javascript">
          <span data-lexical-text="true">r</span>
          <br />
          <span data-lexical-text="true">yar</span>
          <br />
          <br />
          <span data-lexical-text="true">meh</span>
        </code>
      `,
    );
  });

  test('Can switch highlighting language in a toolbar', async ({
    page,
    isRichText,
  }) => {
    await focusEditor(page);
    await page.keyboard.type('``` select * from users');
    if (isRichText) {
      await assertHTML(
        page,
        html`
          <code
            class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
            dir="ltr"
            spellcheck="false"
            data-gutter="1"
            data-highlight-language="javascript"
            data-language="javascript">
            <span data-lexical-text="true">select</span>
            <span
              class="PlaygroundEditorTheme__tokenOperator"
              data-lexical-text="true">
              *
            </span>
            <span data-lexical-text="true">from users</span>
          </code>
        `,
      );
      await click(page, '.toolbar-item.code-language');
      await click(page, 'button:has-text("SQL")');
      await assertHTML(
        page,
        html`
          <code
            class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
            dir="ltr"
            spellcheck="false"
            data-gutter="1"
            data-highlight-language="sql"
            data-language="sql">
            <span
              class="PlaygroundEditorTheme__tokenAttr"
              data-lexical-text="true">
              select
            </span>
            <span data-lexical-text="true"></span>
            <span
              class="PlaygroundEditorTheme__tokenOperator"
              data-lexical-text="true">
              *
            </span>
            <span data-lexical-text="true"></span>
            <span
              class="PlaygroundEditorTheme__tokenAttr"
              data-lexical-text="true">
              from
            </span>
            <span data-lexical-text="true">users</span>
          </code>
        `,
      );
    } else {
      await assertHTML(
        page,
        html`
          <p
            class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
            dir="ltr">
            <span data-lexical-text="true">\`\`\` select * from users</span>
          </p>
        `,
      );
    }
  });

  test('Can maintain indent when creating new lines', async ({
    page,
    isRichText,
    isPlainText,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page);
    await page.keyboard.type('``` alert(1);');
    await page.keyboard.press('Enter');
    await click(page, '.toolbar-item.alignment');
    await click(page, 'button:has-text("Indent")');
    await page.keyboard.type('alert(2);');
    await page.keyboard.press('Enter');
    await page.keyboard.type(';');
    await assertHTML(
      page,
      html`
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="123"
          data-highlight-language="javascript"
          data-language="javascript">
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            alert
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenProperty"
            data-lexical-text="true">
            1
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            alert
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenProperty"
            data-lexical-text="true">
            2
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
        </code>
      `,
    );
  });

  test('Can indent text via tab when selecting the line with Shift+Down', async ({
    page,
    isRichText,
    isPlainText,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page);
    await page.keyboard.type('``` alert(1);');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('alert(2);');
    await moveToStart(page);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.down('Shift');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.up('Shift');
    await page.keyboard.press('Tab');
    await assertHTML(
      page,
      html`
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="123"
          data-highlight-language="javascript"
          data-language="javascript">
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            alert
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenProperty"
            data-lexical-text="true">
            1
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
          <br />
          <br />
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            alert
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenProperty"
            data-lexical-text="true">
            2
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
        </code>
      `,
    );
  });

  test('Can (un)indent multiple lines at once', async ({
    page,
    isRichText,
    isPlainText,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page);
    await page.keyboard.type('``` if (x) {');
    await page.keyboard.press('Enter');
    await click(page, '.toolbar-item.alignment');
    await click(page, 'button:has-text("Indent")');
    await page.keyboard.type('x();');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('}');
    await assertHTML(
      page,
      html`
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="123"
          data-highlight-language="javascript"
          data-language="javascript">
          <span
            class="PlaygroundEditorTheme__tokenAttr"
            data-lexical-text="true">
            if
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span data-lexical-text="true">x</span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            {
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            x
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            }
          </span>
        </code>
      `,
    );
    await page.keyboard.down('Shift');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.up('Shift');
    await click(page, '.toolbar-item.alignment');
    await click(page, 'button:has-text("Indent")');
    await click(page, '.toolbar-item.alignment');
    await click(page, 'button:has-text("Indent")');
    await assertHTML(
      page,
      html`
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="123"
          data-highlight-language="javascript"
          data-language="javascript">
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenAttr"
            data-lexical-text="true">
            if
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span data-lexical-text="true">x</span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            {
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            x
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            }
          </span>
        </code>
      `,
    );
    await page.keyboard.down('Shift');
    await click(page, '.toolbar-item.alignment');
    await click(page, 'button:has-text("Outdent")');
    await page.keyboard.up('Shift');
    await assertHTML(
      page,
      html`
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="123"
          data-highlight-language="javascript"
          data-language="javascript">
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenAttr"
            data-lexical-text="true">
            if
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span data-lexical-text="true">x</span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            {
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            x
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tabNode"
            data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            }
          </span>
        </code>
      `,
    );
    await click(page, '.toolbar-item.alignment');
    await click(page, 'button:has-text("Outdent")');
    await click(page, '.toolbar-item.alignment');
    await click(page, 'button:has-text("Outdent")');
    await assertHTML(
      page,
      html`
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="123"
          data-highlight-language="javascript"
          data-language="javascript">
          <span
            class="PlaygroundEditorTheme__tokenAttr"
            data-lexical-text="true">
            if
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span data-lexical-text="true">x</span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            {
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            x
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
          <br />
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            }
          </span>
        </code>
      `,
    );
  });

  test('Can move around lines with option+arrow keys', async ({
    page,
    isPlainText,
  }) => {
    test.skip(isPlainText);
    const abcHTML = html`
      <code
        class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
        dir="ltr"
        spellcheck="false"
        data-gutter="123"
        data-highlight-language="javascript"
        data-language="javascript">
        <span
          class="PlaygroundEditorTheme__tokenFunction"
          data-lexical-text="true">
          a
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          (
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          )
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          ;
        </span>
        <br />
        <span
          class="PlaygroundEditorTheme__tokenFunction"
          data-lexical-text="true">
          b
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          (
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          )
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          ;
        </span>
        <br />
        <span
          class="PlaygroundEditorTheme__tokenFunction"
          data-lexical-text="true">
          c
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          (
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          )
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          ;
        </span>
      </code>
    `;
    const bcaHTML = html`
      <code
        class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
        dir="ltr"
        spellcheck="false"
        data-gutter="123"
        data-highlight-language="javascript"
        data-language="javascript">
        <span
          class="PlaygroundEditorTheme__tokenFunction"
          data-lexical-text="true">
          b
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          (
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          )
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          ;
        </span>
        <br />
        <span
          class="PlaygroundEditorTheme__tokenFunction"
          data-lexical-text="true">
          c
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          (
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          )
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          ;
        </span>
        <br />
        <span
          class="PlaygroundEditorTheme__tokenFunction"
          data-lexical-text="true">
          a
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          (
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          )
        </span>
        <span
          class="PlaygroundEditorTheme__tokenPunctuation"
          data-lexical-text="true">
          ;
        </span>
      </code>
    `;
    const endOfFirstLine = {
      anchorOffset: 1,
      anchorPath: [0, 3, 0],
      focusOffset: 1,
      focusPath: [0, 3, 0],
    };
    const endOfLastLine = {
      anchorOffset: 1,
      anchorPath: [0, 13, 0],
      focusOffset: 1,
      focusPath: [0, 13, 0],
    };
    await focusEditor(page);
    await page.keyboard.type('``` a();\nb();\nc();');
    await assertHTML(page, abcHTML);
    await assertSelection(page, endOfLastLine);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    // Workaround for #1173: just insert and remove a space to fix Firefox losing the selection
    await page.keyboard.type(' ');
    await page.keyboard.press('Backspace');
    await assertSelection(page, endOfFirstLine);
    // End workaround
    // Ensure attempting to move a line up at the top of a codeblock no-ops
    await page.keyboard.down('Alt');
    await page.keyboard.press('ArrowUp');
    await assertSelection(page, endOfFirstLine);
    await assertHTML(page, abcHTML);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await assertSelection(page, endOfLastLine);
    // Can't move a line down and out of codeblock
    await assertHTML(page, bcaHTML);
    await page.keyboard.press('ArrowDown');
    await assertSelection(page, endOfLastLine);
    await assertHTML(page, bcaHTML);
  });

  test('prevents selection and typing outside code block boundaries', async ({
    page,
    isPlainText,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page);
    await page.keyboard.type('console.log("test");');
    await selectAll(page);
    await toggleCodeBlock(page);

    // Test 1: Selection stays at start when pressing up
    await moveToStart(page);
    await page.keyboard.press('ArrowUp');
    await assertSelection(page, {
      anchorOffset: 0,
      anchorPath: [0, 0, 0],
      focusOffset: 0,
      focusPath: [0, 0, 0],
    });

    // Test 2: Typing at start stays within code block
    await page.keyboard.type('// start');
    await page.keyboard.press('Enter');
    await assertHTML(
      page,
      html`
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="12"
          data-highlight-language="javascript"
          data-language="javascript">
          <span
            class="PlaygroundEditorTheme__tokenComment"
            data-lexical-text="true">
            // start
          </span>
          <br />
          <span data-lexical-text="true">console</span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            .
          </span>
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            log
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenSelector"
            data-lexical-text="true">
            "test"
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
        </code>
      `,
    );

    // Let's verify the cursor position after typing the start comment
    await assertSelection(page, {
      anchorOffset: 0,
      anchorPath: [0, 2, 0],
      focusOffset: 0,
      focusPath: [0, 2, 0],
    });

    // Test 3: Selection stays at end when pressing down
    await moveToEnd(page);
    await page.keyboard.type(' // end');
    await assertHTML(
      page,
      html`
        <code
          class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
          dir="ltr"
          spellcheck="false"
          data-gutter="12"
          data-highlight-language="javascript"
          data-language="javascript">
          <span
            class="PlaygroundEditorTheme__tokenComment"
            data-lexical-text="true">
            // start
          </span>
          <br />
          <span data-lexical-text="true">console</span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            .
          </span>
          <span
            class="PlaygroundEditorTheme__tokenFunction"
            data-lexical-text="true">
            log
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            (
          </span>
          <span
            class="PlaygroundEditorTheme__tokenSelector"
            data-lexical-text="true">
            "test"
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            )
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__tokenComment"
            data-lexical-text="true">
            // end
          </span>
        </code>
      `,
    );

    await page.keyboard.press('ArrowDown');
    await assertSelection(page, {
      anchorOffset: 6,
      anchorPath: [0, 10, 0],
      focusOffset: 6,
      focusPath: [0, 10, 0],
    });

    // Verify no content escaped the code block
    const paragraphs = await page.$$('p');
    expect(paragraphs.length).toBe(0);
  });

  test('When pressing CMD/Ctrl + Left, CMD/Ctrl + Right, the cursor should go to the start of the code', async ({
    page,
    isPlainText,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page);
    await page.keyboard.type('``` ');
    await page.keyboard.press('Space');
    await click(page, '.toolbar-item.alignment');
    await click(page, 'button:has-text("Indent")');
    await page.keyboard.type('a b');
    await page.keyboard.press('Space');
    await page.keyboard.press('Enter');
    await page.keyboard.type('c d');
    await page.keyboard.press('Space');
    await assertHTML(
      page,
      `
      <code
        class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
        dir="ltr"
        spellcheck="false"
        data-gutter="12"
        data-language="javascript"
        data-highlight-language="javascript">
        <span class="PlaygroundEditorTheme__tabNode" data-lexical-text="true"></span>
        <span data-lexical-text="true">a b</span>
        <br />
        <span class="PlaygroundEditorTheme__tabNode" data-lexical-text="true"></span>
        <span data-lexical-text="true">c d</span>
      </code>
    `,
    );

    await selectCharacters(page, 'left', 11);
    await assertSelection(page, {
      anchorOffset: 5,
      anchorPath: [0, 4, 0],
      focusOffset: 1,
      focusPath: [0, 1, 0],
    });

    await moveToStart(page);
    await assertSelection(page, {
      anchorOffset: 0,
      anchorPath: [0, 0, 0],
      focusOffset: 0,
      focusPath: [0, 0, 0],
    });

    await moveToEnd(page);
    await assertSelection(page, {
      anchorOffset: 5,
      anchorPath: [0, 1, 0],
      focusOffset: 5,
      focusPath: [0, 1, 0],
    });

    await moveToStart(page);
    await assertSelection(page, {
      anchorOffset: 1,
      anchorPath: [0, 1, 0],
      focusOffset: 1,
      focusPath: [0, 1, 0],
    });

    await selectCharacters(page, 'right', 11);
    await assertSelection(page, {
      anchorOffset: 1,
      anchorPath: [0, 1, 0],
      focusOffset: 5,
      focusPath: [0, 4, 0],
    });

    await moveToEnd(page);
    await assertSelection(page, {
      anchorOffset: 5,
      anchorPath: [0, 4, 0],
      focusOffset: 5,
      focusPath: [0, 4, 0],
    });
  });

  test('Can create code block with language `diff`', async ({
    page,
    isRichText,
  }) => {
    await focusEditor(page);
    await page.keyboard.type(
      '```diff >let a = 1;\n<let b = 2;\nlet c = 3;\n let d = 4;',
    );
    if (isRichText) {
      await assertHTML(
        page,
        html`
          <code
            class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
            dir="ltr"
            spellcheck="false"
            data-gutter="1234"
            data-highlight-language="diff"
            data-language="diff">
            <span
              class="PlaygroundEditorTheme__tokenInserted"
              data-lexical-text="true">
              &gt;
            </span>
            <span data-lexical-text="true">let a = 1;</span>
            <br />
            <span
              class="PlaygroundEditorTheme__tokenDeleted"
              data-lexical-text="true">
              &lt;
            </span>
            <span data-lexical-text="true">let b = 2;</span>
            <br />
            <span data-lexical-text="true">let c = 3;</span>
            <br />
            <span
              class="PlaygroundEditorTheme__tokenUnchanged"
              data-lexical-text="true"></span>
            <span data-lexical-text="true">let d = 4;</span>
          </code>
        `,
      );
    } else {
      await assertHTML(
        page,
        html`
          <p
            class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
            dir="ltr">
            <span data-lexical-text="true">\`\`\`diff &gt;let a = 1;</span>
            <br />
            <span data-lexical-text="true">&lt;let b = 2;</span>
            <br />
            <span data-lexical-text="true">let c = 3;</span>
            <br />
            <span data-lexical-text="true">let d = 4;</span>
          </p>
        `,
      );
    }
  });

  test('Can create code block with language `diff-javascript`', async ({
    page,
    isRichText,
  }) => {
    await focusEditor(page);
    await page.keyboard.type(
      '```diff-javascript +let a = 1;\n-let b = 2;\nlet c = 3;\n let d = 4;',
    );
    if (isRichText) {
      await assertHTML(
        page,
        html`
          <code
            class="PlaygroundEditorTheme__code PlaygroundEditorTheme__ltr"
            dir="ltr"
            spellcheck="false"
            data-gutter="1234"
            data-highlight-language="diff-javascript"
            data-language="diff-javascript">
            <span
              class="PlaygroundEditorTheme__tokenInserted"
              data-lexical-text="true">
              +
            </span>
            <span
              class="PlaygroundEditorTheme__tokenAttr"
              data-lexical-text="true">
              let
            </span>
            <span data-lexical-text="true">a</span>
            <span
              class="PlaygroundEditorTheme__tokenOperator"
              data-lexical-text="true">
              =
            </span>
            <span data-lexical-text="true"></span>
            <span
              class="PlaygroundEditorTheme__tokenProperty"
              data-lexical-text="true">
              1
            </span>
            <span
              class="PlaygroundEditorTheme__tokenPunctuation"
              data-lexical-text="true">
              ;
            </span>
            <br />
            <span
              class="PlaygroundEditorTheme__tokenDeleted"
              data-lexical-text="true">
              -
            </span>
            <span
              class="PlaygroundEditorTheme__tokenAttr"
              data-lexical-text="true">
              let
            </span>
            <span data-lexical-text="true">b</span>
            <span
              class="PlaygroundEditorTheme__tokenOperator"
              data-lexical-text="true">
              =
            </span>
            <span data-lexical-text="true"></span>
            <span
              class="PlaygroundEditorTheme__tokenProperty"
              data-lexical-text="true">
              2
            </span>
            <span
              class="PlaygroundEditorTheme__tokenPunctuation"
              data-lexical-text="true">
              ;
            </span>
            <br />
            <span data-lexical-text="true">let c = 3;</span>
            <br />
            <span
              class="PlaygroundEditorTheme__tokenUnchanged"
              data-lexical-text="true"></span>
            <span
              class="PlaygroundEditorTheme__tokenAttr"
              data-lexical-text="true">
              let
            </span>
            <span data-lexical-text="true">d</span>
            <span
              class="PlaygroundEditorTheme__tokenOperator"
              data-lexical-text="true">
              =
            </span>
            <span data-lexical-text="true"></span>
            <span
              class="PlaygroundEditorTheme__tokenProperty"
              data-lexical-text="true">
              4
            </span>
            <span
              class="PlaygroundEditorTheme__tokenPunctuation"
              data-lexical-text="true">
              ;
            </span>
          </code>
        `,
      );
    } else {
      await assertHTML(
        page,
        html`
          <p
            class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
            dir="ltr">
            <span data-lexical-text="true">
              \`\`\`diff-javascript +let a = 1;
            </span>
            <br />
            <span data-lexical-text="true">-let b = 2;</span>
            <br />
            <span data-lexical-text="true">let c = 3;</span>
            <br />
            <span data-lexical-text="true">let d = 4;</span>
          </p>
        `,
      );
    }
  });
});
