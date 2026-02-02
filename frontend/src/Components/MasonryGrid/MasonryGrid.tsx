import { useViewportSize } from "@mantine/hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";

interface MasonryItem<T extends object> {
  height: number;
  width: number;
  key: React.Key;
  props: T;
}

interface Props<T extends object> {
  data: MasonryItem<T>[];
  BaseItem: React.ComponentType<T>;
  cols: number | { base: number; [k: number]: number };
  gap?: number;
}

export const MasonryGrid = <T extends object>({
  data,
  BaseItem,
  cols,
  gap = 4,
}: Props<T>) => {
  const { width: screenWidth, height: screenHeight } = useViewportSize();

  const parentContainerRef = useRef<HTMLDivElement | null>(null);

  const [parentWidth, setParentWidth] = useState(0);

  const scrollYRef = useRef(0);
  const [windowKey, setWindowKey] = useState(0); // triggers rerender when needed

  const listTopOnPageRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      const el = parentContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      listTopOnPageRef.current = window.scrollY + rect.top;
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const el = parentContainerRef.current;
    if (!el) return;

    const update = () => setParentWidth(el.offsetWidth);

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf: number | null = null;

    const onScroll = () => {
      scrollYRef.current = window.scrollY;
      if (raf !== null) return;

      raf = requestAnimationFrame(() => {
        setWindowKey((k) => k + 1);
        raf = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  const numCols = useMemo(() => {
    if (typeof cols === "number") {
      return cols;
    }

    const { base, ...numColsObj } = cols;

    const colSizes = Object.keys(numColsObj)
      .map(Number)
      .sort((a, b) => b - a);

    if (!colSizes.length || screenWidth < colSizes[colSizes.length - 1]) {
      return base;
    }

    const colSizeMin = colSizes.find((s) => screenWidth >= s);
    if (!colSizeMin) {
      return base;
    }

    return numColsObj[colSizeMin];
  }, [cols, screenWidth]);

  const imgWidth = useMemo(
    () => (parentWidth - gap * (numCols - 1)) / numCols,
    [parentWidth, gap, numCols]
  );

  const [transformedData, parentHeightNormalized, numGapsParent] =
    useMemo(() => {
      const heights = Array.from({ length: numCols }, () => ({
        height: 0,
        nextRow: 0,
      }));

      const findHeightsMinIdx = () => {
        let minVal = heights[0].height;
        let minIdx = 0;

        for (let i = 1; i < numCols; i++) {
          if (heights[i].height < minVal - 0.01) {
            minVal = heights[i].height;
            minIdx = i;
          }
        }

        return minIdx;
      };

      const res: {
        hwRatio: number;
        normalizedStartY: number;
        colNum: number;
        rowNum: number;
      }[] = [];

      for (let i = 0; i < data.length; i++) {
        const record = data[i];

        const nextIdx = findHeightsMinIdx();
        const hwRatio = record.height / record.width;

        res.push({
          hwRatio,
          colNum: nextIdx,
          normalizedStartY: heights[nextIdx].height,
          rowNum: heights[nextIdx].nextRow,
        });

        heights[nextIdx] = {
          nextRow: heights[nextIdx].nextRow + 1,
          height: heights[nextIdx].height + hwRatio,
        };
      }

      const indexOfMaxHeight = heights
        .map(({ height }) => height)
        .reduce(
          (bestIndex, curr, i) =>
            curr > heights.map(({ height }) => height)[bestIndex]
              ? i
              : bestIndex,
          0
        );

      return [
        res,
        heights[indexOfMaxHeight].height,
        Math.max(heights[indexOfMaxHeight].nextRow - 1, 0),
      ];
    }, [data, numCols]);

  const debouncedUpdateParentWidth = useCallback(
    debounce(
      () => {
        if (parentContainerRef.current) {
          setParentWidth(parentContainerRef.current.offsetWidth);
        }
      },
      50,
      { trailing: true }
    ),
    []
  );

  useEffect(() => {
    if (parentContainerRef.current) {
      setParentWidth(parentContainerRef.current.offsetWidth);
    }

    window.addEventListener("resize", debouncedUpdateParentWidth);
    return () => {
      window.removeEventListener("resize", debouncedUpdateParentWidth);
      debouncedUpdateParentWidth.cancel();
    };
  }, [debouncedUpdateParentWidth]);

  const layoutItems = useMemo(() => {
    return transformedData.map(
      ({ colNum, hwRatio, normalizedStartY, rowNum }, i) => {
        const translateX = colNum * (imgWidth + gap);
        const translateY = normalizedStartY * imgWidth + gap * rowNum;
        const imgHeight = hwRatio * imgWidth;
        const imgBottom = translateY + imgHeight;
        const { key, props } = data[i];
        return { key, props, translateX, translateY, imgHeight, imgBottom };
      }
    );
  }, [transformedData, imgWidth, gap, data]);

  const filteredData = useMemo(() => {
    const BUFFER = 500;
    const containerTop = listTopOnPageRef.current - scrollYRef.current;

    return layoutItems.filter(({ translateY, imgBottom }) => {
      return !(
        containerTop + imgBottom < -BUFFER ||
        containerTop + translateY > screenHeight + BUFFER
      );
    });
  }, [windowKey, layoutItems, screenHeight]);

  return (
    <div
      ref={parentContainerRef}
      style={{
        position: "relative",
        height: parentHeightNormalized * imgWidth + numGapsParent * gap,
      }}
    >
      {filteredData.map(({ imgHeight, key, props, translateX, translateY }) => {
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: imgWidth,
              height: imgHeight,
              transform: `translate(${translateX}px, ${translateY}px)`,
            }}
            key={key}
          >
            <BaseItem {...props} />
          </div>
        );
      })}
    </div>
  );
};
