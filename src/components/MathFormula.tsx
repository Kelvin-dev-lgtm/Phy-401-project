/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  math: string;
  block?: boolean;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ math, block = false }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={block ? 'block my-2 overflow-x-auto text-cyan-200' : 'inline-block px-1 text-cyan-200'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
