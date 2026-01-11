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
  const { width: screenWidth } = useViewportSize();

  const parentContainerRef = useRef<HTMLDivElement | null>(null);

  const [parentWidth, setParentWidth] = useState(0);

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
          if (heights[i].height < minVal) {
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
      { leading: true, trailing: true }
    ),
    []
  );

  useEffect(() => {
    debouncedUpdateParentWidth();

    window.addEventListener("resize", debouncedUpdateParentWidth);
    return () => {
      window.removeEventListener("resize", debouncedUpdateParentWidth);
      debouncedUpdateParentWidth.cancel();
    };
  }, [debouncedUpdateParentWidth]);

  return (
    <div
      ref={parentContainerRef}
      style={{
        position: "relative",
        height: parentHeightNormalized * imgWidth + numGapsParent * gap,
      }}
    >
      {transformedData.map(
        ({ colNum, hwRatio, normalizedStartY, rowNum }, i) => {
          const translateX = colNum * (imgWidth + gap);
          const translateY = normalizedStartY * imgWidth + gap * rowNum;

          const { key, props } = data[i];

          return (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: imgWidth,
                height: hwRatio * imgWidth,
                transform: `translate(${translateX}px, ${translateY}px)`,
              }}
              key={key}
            >
              <BaseItem {...props} />
            </div>
          );
        }
      )}
    </div>
  );
};
