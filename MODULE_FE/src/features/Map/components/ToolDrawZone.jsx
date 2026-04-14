
import { Circle, Line, Group, Text } from "react-konva";

export const DrawingPoints = ({ points, scale = 1 }) => {
  let pointPairs = [];
  if (points.length > 0) {
    for (let i = 0; i < points.length; i += 2) {
      pointPairs.push([points[i], points[i + 1]]);
    }
  }
  const radius = 5 / scale;
  const strokeWidth = 2 / scale;
  const fontSize = 12 / scale;
  const textOffset = 8 / scale;

  return (
    <>
      {pointPairs.map((p, i) => (
        <Group key={i}>
          <Circle
            x={p[0]}
            y={p[1]}
            radius={radius}
            fill="#EF4444" 
            stroke="#FFF"
            strokeWidth={strokeWidth}
          />
          <Text
            x={p[0] - textOffset}
            y={p[1] - textOffset - radius}
            text={String(i + 1)}
            fontSize={fontSize}
            fontStyle="bold"
            fill="#FFF"
            shadowColor="black"
            shadowBlur={2}
          />
          {i > 0 && (
            <Line
              points={[pointPairs[i - 1][0], pointPairs[i - 1][1], p[0], p[1]]}
              stroke="#3B82F6"
              strokeWidth={strokeWidth}
            />
          )}
        </Group>
      ))}
      {pointPairs.length >= 3 && (
        <Line
          points={[
            pointPairs[pointPairs.length - 1][0],
            pointPairs[pointPairs.length - 1][1],
            pointPairs[0][0],
            pointPairs[0][1],
          ]}
          stroke="#3B82F6"
          strokeWidth={strokeWidth}
          dash={[10 / scale, 5 / scale]}
        />
      )}
    </>
  );
};

