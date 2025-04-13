import React, { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  numColumns: number;
  gap?: number;
}

export const MasonryGrid = ({ children, numColumns, gap }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [columns, setColumns] = useState<React.ReactNode[][]>([]);

  useEffect(() => {
    if (React.Children.count(children) < elementsRef.current.length) {
      elementsRef.current.splice(React.Children.count(children));
    }
  }, [React.Children.count(children)]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const organizeCols = () => {
      const childArray: React.ReactNode[] = React.Children.toArray(children);

      const childNodes = elementsRef.current.filter(
        (node) => node?.nodeType === Node.ELEMENT_NODE
      ) as HTMLElement[];

      const heights = childNodes.map(
        (node) => node.getBoundingClientRect().height ?? 0
      );

      if (heights.slice(0, React.Children.count(children)).some((h) => !h)) {
        return;
      }

      const heightCols = Array(numColumns).fill(0);
      const cols: React.ReactNode[][] = Array.from(
        { length: numColumns },
        () => []
      );

      childArray.forEach((node, index) => {
        const minHeightIndex = heightCols.findIndex(
          (h) => h === Math.min(...heightCols)
        );

        cols[minHeightIndex].push(node);
        heightCols[minHeightIndex] += heights[index];
      });

      setColumns(cols);
    };

    const observer = new ResizeObserver(() => {
      organizeCols();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [children]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        position: "relative",
        gap,
      }}
    >
      {columns.map((col, index) => (
        <div
          key={index}
          style={{ display: "flex", flexDirection: "column", flex: 1, gap }}
        >
          {col.map((el, index) => (
            <React.Fragment key={index}>{el}</React.Fragment>
          ))}
        </div>
      ))}
      <div
        ref={containerRef}
        style={{ visibility: "hidden", position: "fixed" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          {Array(numColumns)
            .fill(undefined)
            .map((_, colIndex) => (
              <div
                key={colIndex}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                {colIndex === 0 &&
                  React.Children.map(children, (child, index) => (
                    <div
                      style={{ position: index === 0 ? "inherit" : "inherit" }}
                    >
                      <div
                        ref={(el) => {
                          if (!el) {
                            return;
                          }

                          elementsRef.current[index] = el;
                        }}
                        key={index}
                      >
                        {child}
                      </div>
                    </div>
                  ))}
                {colIndex !== 0 && <div />}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
