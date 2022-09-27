/****************************/
/**
 * Reusable methods
 */
export declare const EditableComponent: {
    /**
     * ctx means this in vue2 and vue3 and other obj
     * @param event
     * @param editor
     * @param ctx
     */
    onClick(event: any, editor: any, ctx: any): void;
    onBeforeInput(event: any, editor: any, ctx: any): void;
    onCompositionEnd(event: any, editor: any, ctx: any): void;
    onCompositionStart(event: any, editor: any, ctx: any): void;
    onKeyDown(event: any, editor: any, ctx: any): void;
    onFocus(event: any, editor: any, ctx: any): void;
    onBlur(event: any, editor: any, ctx: any): void;
    onCopy(event: any, editor: any, ctx: any): void;
    onPaste(event: any, editor: any, ctx: any): void;
    onCut(event: any, editor: any, ctx: any): void;
    onDragOver(event: any, editor: any, ctx: any): void;
    onDragStart(event: any, editor: any, ctx: any): void;
    onDrop(event: any, editor: any, ctx: any): void;
    onSelectionchange(editor: any, ctx: any): void;
};
