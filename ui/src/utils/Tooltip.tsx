import Tippy, { TippyProps } from '@tippy.js/react';
import * as React from 'react';

export const Tooltip = ( props: TippyProps ) => (
    <Tippy animation='fade' appendTo={document.body}  theme='light' interactive={true} {...props} />
);