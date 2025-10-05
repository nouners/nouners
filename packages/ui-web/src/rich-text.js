import React from "react";
import { dimension as dimensionUtils } from "@shades/common/utils";
import Image from "./image.js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const SINGLE_IMAGE_ATTACHMENT_MAX_WIDTH = 560;
export const SINGLE_IMAGE_ATTACHMENT_MAX_HEIGHT = 280;
export const MULTI_IMAGE_ATTACHMENT_MAX_WIDTH = 280;
export const MULTI_IMAGE_ATTACHMENT_MAX_HEIGHT = 240;

export const DEFAULT_BLOCK_GAP = "1.25em";
export const DEFAULT_COMPACT_BLOCK_GAP = "0.625em";

// note: emotion doesn’t accept :is without a leading star in some cases (*:is)
export const RICH_TEXT_CLASS = "rt";

const blockComponentsByElementType = {
  paragraph: "p",
  "heading-1": "h1",
  "heading-2": "h2",
  "heading-3": "h3",
  "heading-4": "h4",
  "heading-5": "h5",
  "heading-6": "h6",
  "bulleted-list": "ul",
  "numbered-list": "ol",
  quote: "blockquote",
  callout: "aside",
};

const renderLeaf = (l, i) => {
  let children = l.text;
  if (l.bold) children = <strong key={i}>{children}</strong>;
  if (l.italic) children = <em key={i}>{children}</em>;
  if (l.strikethrough) children = <s key={i}>{children}</s>;
  if (l.underline)
    children = (
      <span key={i} className="underline">
        {children}
      </span>
    );
  return <React.Fragment key={i}>{children}</React.Fragment>;
};

const createRenderer = ({
  inline,
  suffix,
  imagesMaxWidth,
  imagesMaxHeight,
  onClickInteractiveElement,
  renderElement: customRenderElement,
}) => {
  const renderElement = (el, i, els, { root = false, parent } = {}) => {
    const renderNode = (n, i, ns, cx) =>
      n.text == null ? renderElement(n, i, ns, cx) : renderLeaf(n, i, ns);

    const children = (context) =>
      el.children?.map((n, i, ns) => renderNode(n, i, ns, context));

    if (typeof customRenderElement === "function") {
      const renderResult = customRenderElement(el, i, els, {
        root,
        renderChildren: children,
      });
      if (renderResult != null) return renderResult;
    }

    switch (el.type) {
      // Top level block elements
      case "paragraph":
      case "bulleted-list":
      case "numbered-list":
      case "heading-1":
      case "heading-2":
      case "heading-3":
      case "heading-4":
      case "heading-5":
      case "heading-6":
      case "quote":
      case "callout": {
        const isLast = i === els.length - 1;
        const Component = blockComponentsByElementType[el.type];

        const props = {};
        if (el.type === "numbered-list" && el.start != null)
          props.start = el.start;

        return (
          <Component key={i} {...props}>
            {children()}
            {inline && " "}
            {isLast && suffix}
          </Component>
        );
      }

      case "code-block": {
        const isLast = i === els.length - 1;

        return (
          <React.Fragment key={i}>
            {inline ? (
              <code>{el.code}</code>
            ) : (
              <pre key={i}>
                <code>{el.code}</code>
              </pre>
            )}
            {isLast && suffix}
          </React.Fragment>
        );
      }

      case "list-item":
        return <li key={i}>{children()}</li>;

      case "link": {
        const content =
          el.label != null
            ? el.label
            : el.children != null
              ? children()
              : el.url;
        return (
          <a
            key={i}
            href={el.url}
            target="_blank"
            rel="noreferrer"
            className="link"
            onClick={(e) => onClickInteractiveElement?.(e)}
          >
            {content}
          </a>
        );
      }

      case "code":
        return <code key={i}>{el.code}</code>;

      case "table": {
        const isLast = i === els.length - 1;
        return (
          <React.Fragment key={i}>
            {inline ? <>[table]</> : <table>{children()}</table>}
            {isLast && suffix}
          </React.Fragment>
        );
      }
      case "table-head":
        return <thead key={i}>{children()}</thead>;
      case "table-body":
        return <tbody key={i}>{children()}</tbody>;
      case "table-row":
        return <tr key={i}>{children()}</tr>;
      case "table-cell":
        return <td key={i}>{children()}</td>;

      case "horizontal-divider":
        return <hr key={i} />;

      case "attachments":
      case "image-grid": {
        if (inline) {
          if (root && i === 0)
            return (
              <React.Fragment key={i}>
                {renderNode({ text: "Image attachment ", italic: true })}
              </React.Fragment>
            );
          return null;
        }

        return (
          <div
            key={i}
            className="grid"
            style={{
              paddingTop: el.type === "attachments" ? "0.5rem" : undefined,
            }}
          >
            <div>{children({ parent: el })}</div>
          </div>
        );
      }

      case "image":
      case "image-attachment": {
        if (inline) return null;

        const attachmentCount = els.length;

        const [defaultMaxWidth, defaultMaxHeight] =
          el.type === "image" || attachmentCount === 1
            ? [
                SINGLE_IMAGE_ATTACHMENT_MAX_WIDTH,
                SINGLE_IMAGE_ATTACHMENT_MAX_HEIGHT,
              ]
            : [
                MULTI_IMAGE_ATTACHMENT_MAX_WIDTH,
                MULTI_IMAGE_ATTACHMENT_MAX_HEIGHT,
              ];

        return (
          <ImageComponent
            key={i}
            element={el}
            maxWidth={
              imagesMaxWidth === null
                ? null
                : (imagesMaxWidth ?? defaultMaxWidth)
            }
            maxHeight={
              imagesMaxHeight === null
                ? null
                : (imagesMaxHeight ?? defaultMaxHeight)
            }
            inline={
              parent == null ||
              !["attachments", "image-grid"].includes(parent.type)
            }
            onClick={
              el.interactive === false
                ? undefined
                : () => {
                    onClickInteractiveElement?.(el);
                  }
            }
          />
        );
      }

      default:
        return (
          <span
            key={i}
            title={JSON.stringify(el, null, 2)}
            className="inline-block whitespace-nowrap bg-(--color-surface-muted) px-1 text-text-dimmed"
          >
            Unsupported element type: <span className="italic">{el.type}</span>
          </span>
        );
    }
  };

  return (blocks) =>
    blocks.map((b, i, bs) => renderElement(b, i, bs, { root: true }));
};

const ImageComponent = ({
  element: el,
  maxWidth,
  maxHeight,
  inline,
  onClick,
}) => {
  const [dimensions, setDimensions] = React.useState(null);

  const width = el.width ?? dimensions?.width;
  const height = el.height ?? dimensions?.height;

  const fittedWidth =
    // Skip fitting step if both max dimensions are explicitly set to `null`
    maxWidth === null && maxHeight === null
      ? width
      : width == null
        ? null
        : dimensionUtils.fitInsideBounds(
            { width, height },
            { width: maxWidth, height: maxHeight },
          ).width;

  const hasDimensions = fittedWidth != null;

  const ContainerComponent = onClick == null ? "span" : "button";

  return (
    <ContainerComponent
      className="image"
      data-inline={inline}
      data-interactive={onClick == null ? undefined : true}
      onClick={onClick}
      style={{ width: fittedWidth, maxWidth: "100%" }}
    >
      <Image
        src={el.url}
        loading="lazy"
        width={fittedWidth}
        onLoad={(dimensions) => {
          if (el.width == null) setDimensions(dimensions);
        }}
        style={{
          maxWidth: "100%",
          maxHeight: hasDimensions ? undefined : maxHeight,
          aspectRatio: el.width == null ? undefined : `${width} / ${height}`,
        }}
      />
      {/* Hide caption until we have dimensions to prevent overflow */}
      {hasDimensions && el.caption != null && (
        <span className="image-caption">
          <span className="text-container">{el.caption}</span>
        </span>
      )}
    </ContainerComponent>
  );
};

const RichText = React.forwardRef(
  (
    {
      inline = false,
      compact = false,
      blocks,
      onClickInteractiveElement,
      renderElement,
      suffix,
      imagesMaxWidth,
      imagesMaxHeight,
      style,
      className,
      raw = false,
      ...props
    },
    ref,
  ) => {
    const render = createRenderer({
      inline,
      suffix,
      imagesMaxWidth,
      imagesMaxHeight,
      renderElement,
      onClickInteractiveElement,
    });

    if (raw) {
      // Passing ref in `raw` mode isn’t allowed
      if (ref != null) throw new Error();
      return render(blocks);
    }

    const inlineStyle = { ...(style ?? {}) };
    inlineStyle["--default-block-gap"] = DEFAULT_BLOCK_GAP;
    inlineStyle["--default-compact-block-gap"] = DEFAULT_COMPACT_BLOCK_GAP;

    if (!inline) {
      inlineStyle.whiteSpace = "pre-wrap";
    }

    if (inline || compact) {
      inlineStyle.display = "inline";
    }

    return (
      <div
        ref={ref}
        data-inline={inline}
        data-compact={compact}
        className={twMerge(clsx(RICH_TEXT_CLASS), className)}
        style={inlineStyle}
        {...props}
      >
        {render(blocks)}
      </div>
    );
  },
);

export default RichText;
