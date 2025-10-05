import React from "react";
import clsx from "clsx";
import { ArrowDownSmall as ArrowDownSmallIcon } from "@shades/ui-web/icons";

const VotesTagGroup = React.memo(
  ({
    for: for_,
    against,
    abstain,
    quorum,
    highlight,
    component: Component = "span",
    ...props
  }) => {
    const containerClassName = clsx(
      "inline-flex gap-[0.1rem] whitespace-nowrap text-xs leading-[1.2] text-text-dimmed rounded-[0.2rem]",
      "[&>*]:flex [&>*]:items-center [&>*]:justify-center [&>*]:min-w-[1.86rem]",
      "[&>*]:bg-[var(--color-surface-muted)] [&>*]:px-[0.5em] [&>*]:py-[0.3em]",
      "[&>*:first-of-type]:rounded-l-[0.2rem] [&>*:last-of-type]:rounded-r-[0.2rem]",
      "[&_.quorum]:ml-[0.3em]",
    );

    const highlightedClassName =
      "bg-[var(--color-surface-strong)] text-text-normal font-semibold [&_.quorum]:text-text-dimmed [&_.quorum]:font-normal";

    const arrowClassName = "ml-[0.2rem] mr-[-0.1rem] w-[0.9rem]";

    return (
      <Component className={containerClassName} {...props}>
        <span className={clsx(highlight === "for" && highlightedClassName)}>
          {for_}
          <ArrowDownSmallIcon
            className={clsx(arrowClassName, "-scale-y-100")}
          />
          {quorum != null && <span className="quorum"> / {quorum}</span>}
        </span>
        <span className={clsx(highlight === "abstain" && highlightedClassName)}>
          {abstain}
        </span>
        <span className={clsx(highlight === "against" && highlightedClassName)}>
          {against}
          <ArrowDownSmallIcon className={arrowClassName} />
        </span>
      </Component>
    );
  },
);

export default VotesTagGroup;
