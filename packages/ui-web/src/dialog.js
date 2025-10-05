import React from "react";
import clsx from "clsx";
import { Overlay, useDialog, useModalOverlay } from "react-aria";
import { useMatchMedia } from "@shades/common/react";
import { twMerge } from "tailwind-merge";

const Dialog = React.forwardRef(({ children, ...props }, dialogRef) => {
  const internalRef = React.useRef();
  const ref = dialogRef ?? internalRef;

  const { dialogProps, titleProps } = useDialog(props, ref);

  return (
    <div ref={ref} {...dialogProps} {...props}>
      {typeof children === "function" ? children({ titleProps }) : children}
    </div>
  );
});

const ModalDialog = React.forwardRef(
  (
    {
      isOpen,
      onRequestClose,
      width,
      height,
      tray = false,
      trayViewportCoveredBehavior = "ignore",
      background,
      trayBackground,
      backdrop = "normal",
      modalProps: customModalProps,
      underlayProps: customUnderlayProps,
      children,
      className,
      ...dialogProps
    },
    externalDialogRef,
  ) => {
    const underlayRef = React.useRef(null);
    const modalRef = React.useRef(null);
    const internalDialogRef = React.useRef(null);
    const navBarFillerRef = React.useRef(null);

    const closeRef = React.useRef(onRequestClose);

    React.useEffect(() => {
      closeRef.current = onRequestClose;
    });

    const dialogRef = externalDialogRef ?? internalDialogRef;

    const isSmallDevice = useMatchMedia("(max-width: 600px)");

    const { modalProps, underlayProps } = useModalOverlay(
      { isDismissable: true },
      { isOpen, close: onRequestClose },
      modalRef,
    );

    const [isClosing, setClosing] = React.useState(false);
    const [
      { visualViewportHeight, visualViewportInset, dialogHeight, navBarHeight },
      setViewportData,
    ] = React.useState({});

    const isViewportCovered =
      typeof window !== "undefined" &&
      visualViewportInset > window.innerHeight / 4;

    const fitsInViewport =
      visualViewportHeight == null ||
      visualViewportHeight > dialogHeight + navBarHeight;

    const variant = (() => {
      if (isSmallDevice) return "snap-tray";
      return tray ? "tray" : "regular";
    })();

    React.useEffect(() => {
      if (!isOpen) return;

      let cancelled = false;

      const update = () => {
        if (cancelled) return;
        setViewportData({
          visualViewportHeight: window.visualViewport.height,
          visualViewportInset:
            window.innerHeight - window.visualViewport.height,
          dialogHeight: dialogRef.current?.offsetHeight ?? 0,
          navBarHeight: navBarFillerRef.current?.offsetHeight ?? 0,
        });
      };

      let req;
      const scheduleUpdate = () => {
        if (req != null) window.cancelAnimationFrame(req);
        req = window.requestAnimationFrame(update);
      };

      const resizeHandler = () => {
        if (req == null) {
          update();
        }
        scheduleUpdate();
      };
      window.visualViewport.addEventListener("resize", resizeHandler);

      const observer = new ResizeObserver(() => {
        update();
      });

      observer.observe(dialogRef.current);

      update();

      return () => {
        cancelled = true;
        window.visualViewport.removeEventListener("resize", resizeHandler);
        observer.disconnect();
      };
    }, [isOpen, dialogRef]);

    React.useEffect(() => {
      if (!isOpen) return;

      if (["tray", "snap-tray"].includes(variant)) {
        navBarFillerRef.current.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
      }
    }, [variant, isOpen]);

    React.useEffect(() => {
      if (!isOpen) return;
      if (!["tray", "snap-tray"].includes(variant)) return;

      if (
        isViewportCovered &&
        trayViewportCoveredBehavior === "snap-to-bottom"
      ) {
        modalRef.current.scrollIntoView({
          behavior: "instant",
          block: "bottom",
        });
      }
    }, [variant, isOpen, isViewportCovered, trayViewportCoveredBehavior]);

    React.useEffect(() => {
      if (!isOpen) return;
      if (variant !== "snap-tray") return;

      const requestClose = () => {
        let didClose = false;
        const close = () => {
          if (didClose) return;
          closeRef.current();
          didClose = true;
          setClosing(false);
        };
        el.dataset.closing = "true";
        el.addEventListener("animationend", close);
        setTimeout(close, 500);
        setClosing(true);
      };

      const { current: el } = underlayRef;

      let isTouching = false;

      const handleScroll = (() => {
        let swipeData = null;
        let scrollEndTimeoutHandle;

        return () => {
          if (isTouching) return;

          if (scrollEndTimeoutHandle != null)
            clearTimeout(scrollEndTimeoutHandle);

          scrollEndTimeoutHandle = setTimeout(() => {
            swipeData = null;
          }, 250);

          const { scrollTop } = el;

          if (swipeData == null) {
            swipeData = {
              lastScrollTop: scrollTop,
              lastScrollTopTimestamp: Date.now(),
            };
            return;
          }

          if (swipeData.direction === "up") {
            return;
          }

          const scrollTopDelta = scrollTop - swipeData.lastScrollTop;
          const timeDelta = Date.now() - swipeData.lastScrollTopTimestamp;

          const direction = scrollTopDelta > 0 ? "up" : "down";
          const velocity = Math.abs(scrollTopDelta / timeDelta);

          swipeData.lastScrollTopTimestamp = Date.now();
          swipeData.lastScrollTop = scrollTop;
          if (swipeData.direction == null) swipeData.direction = direction;

          const modalRect = modalRef.current.getBoundingClientRect();

          const isPastCloseThreshold =
            modalRect.top >= window.visualViewport.height * 0.9;
          const isPastMidStop =
            modalRect.top >= window.visualViewport.height / 2;

          if (isPastCloseThreshold || (isPastMidStop && velocity > 0.2)) {
            requestClose();
          }
        };
      })();

      const eventHandlers = [
        ["scroll", handleScroll],
        ["touchstart", () => (isTouching = true)],
        ["touchend", () => (isTouching = false)],
        ["touchmove", () => (isTouching = true)],
      ];

      for (const [name, handler] of eventHandlers)
        el.addEventListener(name, handler, { passive: true });

      return () => {
        for (const [name, handler] of eventHandlers)
          el.removeEventListener(name, handler);
      };
    }, [variant, isOpen, modalRef]);

    if (!isOpen) return null;

    return (
      <Overlay>
        <div
          ref={underlayRef}
          data-variant={variant}
          data-fits-in-viewport={fitsInViewport}
          data-viewport-covered={isViewportCovered}
          data-tray-viewport-covered-behavior={trayViewportCoveredBehavior}
          data-closing={isClosing || undefined}
          {...underlayProps}
          {...customUnderlayProps}
          className={twMerge(
            clsx(
              "fixed inset-0 z-[10] overflow-auto transition-colors duration-100",
              "bg-[var(--backdrop,hsl(0_0%_0%_/_40%))]",
              "data-[variant=snap-tray]:scroll-snap-y-mandatory data-[variant=snap-tray]:[scrollbar-width:none]",
              "data-[variant=snap-tray]:[&::-webkit-scrollbar]:hidden",
              "data-[variant=regular]:flex data-[variant=regular]:items-center data-[variant=regular]:justify-center data-[variant=regular]:px-[2.8rem] data-[variant=regular]:py-[1.6rem]",
              "data-[variant=snap-tray]:flex data-[variant=snap-tray]:flex-col",
              "data-[variant=tray]:flex data-[variant=tray]:flex-col",
            ),
            customUnderlayProps?.className,
            className,
          )}
          style={{
            ...customUnderlayProps?.style,
            "--specified-dialog-width": width,
            "--specified-dialog-height": height,
            "--specified-background": background,
            "--specified-tray-background": trayBackground ?? background,
            "--backdrop":
              backdrop === "none"
                ? "none"
                : backdrop === "light"
                  ? "hsl(0 0% 0% / 20%)"
                  : undefined,
          }}
        >
          <div
            className="snap-tray-only"
            style={{ paddingTop: "50dvh", scrollSnapAlign: "start" }}
          />
          <div
            className="snap-tray-only"
            style={{
              paddingTop: `calc(50dvh - var(--size-navbar, 4.7rem))`,
              scrollSnapAlign: "start",
            }}
          />
          <div
            ref={navBarFillerRef}
            className="tray-only"
            style={{
              minHeight: "var(--size-navbar, 4.7rem)",
              scrollSnapAlign: "start",
            }}
          />
          <div className="snap-tray-only snap-tray-shadow shadow-elevation-high" />
          <div
            ref={modalRef}
            data-variant={variant}
            className={twMerge(
              clsx(
                "modal mx-auto flex w-full flex-col bg-(--specified-background,var(--color-surface-primary)) text-text-normal outline-hidden",
                "data-[variant=snap-tray]:min-h-[min-content] data-[variant=snap-tray]:overflow-hidden data-[variant=snap-tray]:rounded-t-md",
                "data-[variant=snap-tray]:bg-(--specified-tray-background,var(--color-surface-primary))",
                "data-[variant=snap-tray]:animate-[tray-enter_0.325s_ease-out_forwards]",
                "data-[variant=tray]:flex data-[variant=tray]:flex-col data-[variant=tray]:rounded-t-md",
                "data-[variant=tray]:bg-(--specified-tray-background,var(--color-surface-primary))",
                "data-[variant=tray]:animate-[tray-enter_0.325s_ease-out_forwards]",
                "md:data-[variant=snap-tray]:max-w-full md:data-[variant=snap-tray]:w-[var(--specified-dialog-width,62rem)] md:data-[variant=snap-tray]:animate-[tray-enter-desktop_0.2s_ease-out_forwards]",
                "md:data-[variant=tray]:px-0 md:data-[variant=tray]:w-[var(--specified-dialog-width,62rem)] md:data-[variant=tray]:min-h-[var(--specified-dialog-height,calc(100dvh-var(--size-navbar,4.7rem)))] md:data-[variant=tray]:animate-[tray-enter-desktop_0.2s_ease-out_forwards]",
                "data-[variant=regular]:w-[var(--specified-dialog-width,62rem)] data-[variant=regular]:max-w-full data-[variant=regular]:rounded-md data-[variant=regular]:animate-[dialog-enter-centered_0.2s_ease-out_forwards]",
              ),
              customModalProps?.className,
            )}
            {...modalProps}
            {...customModalProps}
          >
            <Dialog
              ref={dialogRef}
              {...dialogProps}
              variant={variant}
              className="dialog flex h-full min-h-0 flex-col outline-hidden"
            >
              {(props) =>
                typeof children === "function"
                  ? children({ ...props, variant })
                  : children
              }
            </Dialog>
            {trayViewportCoveredBehavior === "snap-to-bottom" && (
              <div
                className="snap-tray-only"
                style={{
                  paddingTop:
                    visualViewportInset == null
                      ? undefined
                      : `${visualViewportInset}px`,
                }}
              />
            )}
          </div>
          {fitsInViewport && (
            <div
              className="snap-tray-only bg-(--specified-tray-background,var(--color-surface-primary))"
              style={{ paddingTop: "50dvh" }}
            />
          )}
        </div>
      </Overlay>
    );
  },
);

export default ModalDialog;
