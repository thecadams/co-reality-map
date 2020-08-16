import React, {
  useCallback,
  useState,
  useMemo,
  CSSProperties,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { DraggableSubvenue } from "./DraggableSubvenue";
import { snapToGrid as doSnapToGrid } from "./snapToGrid";
import update from "immutability-helper";
import { DragItem } from "./interfaces";
import { DEFAULT_MAP_ICON_URL, PLAYA_ICON_SIDE } from "settings";

const styles: React.CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
};
interface SubVenueIconMap {
  [key: string]: { top: number; left: number; url: string };
}

interface PropsType {
  snapToGrid: boolean;
  iconsMap: SubVenueIconMap;
  backgroundImage: string;
  iconImageStyle: CSSProperties;
  onChange: (val: SubVenueIconMap) => void;
  otherIcons: SubVenueIconMap;
  coordinatesBoundary: number;
}

export const Container: React.FC<PropsType> = (props) => {
  const {
    snapToGrid,
    iconsMap,
    backgroundImage,
    iconImageStyle,
    onChange,
    otherIcons,
    coordinatesBoundary,
  } = props;
  const [boxes, setBoxes] = useState<SubVenueIconMap>(iconsMap);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const mapRef = useRef<HTMLDivElement>(null);

  // trigger the parent callback on boxes change (as a result of movement)
  useEffect(() => {
    //need to return the unscaled values
    const unscaledBoxes = Object.keys(boxes).reduce(
      (acc, val) => ({
        ...acc,
        [val]: {
          ...boxes[val],
          top: boxes[val].top / scale.y,
          left: boxes[val].left / scale.x,
        },
      }),
      {}
    );
    onChange(unscaledBoxes);
  }, [boxes, onChange, scale]);

  useLayoutEffect(() => {
    mapRef?.current?.getBoundingClientRect().width &&
      setScale({
        x: mapRef.current.getBoundingClientRect().width / coordinatesBoundary,
        y: mapRef.current.getBoundingClientRect().height / coordinatesBoundary,
      });
  }, [setScale, mapRef, coordinatesBoundary]);

  useLayoutEffect(() => {
    const rescale = () => {
      mapRef?.current?.getBoundingClientRect().width &&
        setScale({
          x: mapRef.current.getBoundingClientRect().width / coordinatesBoundary,
          y:
            mapRef.current.getBoundingClientRect().height / coordinatesBoundary,
        });
    };

    window.addEventListener("resize", rescale);
    return () => {
      window.removeEventListener("resize", rescale);
    };
  }, [coordinatesBoundary]);

  useMemo(() => {
    const copy = Object.keys(iconsMap).reduce(
      (acc, val) => ({
        ...acc,
        [val]: {
          ...iconsMap[val],
          top: iconsMap[val].top * scale.y,
          left: iconsMap[val].left * scale.x,
        },
      }),
      {}
    );

    setBoxes(copy);
  }, [iconsMap, scale]);

  const moveBox = useCallback(
    (id: string, left: number, top: number) => {
      setBoxes(
        update(boxes, {
          [id]: {
            $merge: { left, top },
          },
        })
      );
    },
    [boxes]
  );

  const [, drop] = useDrop({
    accept: ItemTypes.SUBVENUE_ICON,
    drop(item: DragItem, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset() as {
        x: number;
        y: number;
      };

      let left = Math.round(item.left + delta.x);
      let top = Math.round(item.top + delta.y);
      if (snapToGrid) {
        [left, top] = doSnapToGrid(left, top);
      }

      moveBox(item.id, left, top);
      return undefined;
    },
  });

  return (
    <div ref={drop} style={styles}>
      <div
        style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}
        ref={mapRef}
      >
        <img
          alt="draggable background "
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
          src={backgroundImage}
        />
        {useMemo(
          () =>
            Object.values(otherIcons).map((icon) => (
              <img
                key={`${icon.top}-${icon.left}-${icon.url}`}
                src={icon.url || DEFAULT_MAP_ICON_URL}
                style={{
                  position: "absolute",
                  top: icon.left * scale.x,
                  left: icon.top * scale.y,
                  width: PLAYA_ICON_SIDE, // @debt should be at the right scale
                  opacity: 0.4,
                }}
                alt={`${icon.url} map icon`}
              />
            )),
          [otherIcons, scale]
        )}
      </div>
      {Object.keys(boxes).map((key) => (
        <DraggableSubvenue
          key={key}
          id={key}
          imageStyle={iconImageStyle}
          {...boxes[key]}
        />
      ))}
    </div>
  );
};