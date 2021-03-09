import React, { useRef, useState, FC, ReactNode } from 'react';
import { Animated, View, StyleSheet, PanResponder, Text } from "react-native";

import { Mesh } from 'three';
import { a, useSpring } from '@react-spring/three';
import { Canvas, useFrame } from 'react-three-fiber';

interface PanWrapperProps {
  children: ReactNode
}

const PanWrapper: FC<PanWrapperProps> = ({ children }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
      },
      onPanResponderMove: (e, gestureState) => {
        // x and y coordinates
        console.log(pan);

        Animated.event([
          null,
          { dx: pan.x, dy: pan.y },
        ])(e, gestureState);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Drag this box!</Text>
      <Animated.View
        style={{
          transform: [{ translateX: pan.x }, { translateY: pan.y }]
        }}
        {...panResponder.panHandlers}
      >
        {/* the canvas doesn't render if this view is removed */}
        <View style={styles.box} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold"
  },
  box: {
    width: 150,
    height: 150,
    borderRadius: 5,
    backgroundColor: "blue",
  }
});

interface Props {
  position: [number, number, number]
}

const ReactSpringBox: FC = () => {
  const [active, setActive] = useState(0)

  // create a common spring that will be used later to interpolate other values
  const { spring } = useSpring({
    spring: active,
    config: { mass: 5, tension: 400, friction: 50, precision: 0.0001 }
  })

  // interpolate values from common springs
  const scale = spring.to([0, 1], [1, 5])
  const rotation = spring.to([0, 1], [0, Math.PI])
  const color = spring.to([0, 1], ['#6246ea', '#e45858'])

  return (
    // using a from react-spring will animate our component
    <a.group position-y={scale}>
      <a.mesh rotation-y={rotation} scale-x={scale} scale-z={scale} onClick={() => setActive(Number(!active))}>
        <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
        <a.meshStandardMaterial roughness={0.5} attach="material" color={color} />
      </a.mesh>
    </a.group>
  )
}

const Box: FC<Props> = ({ position }) => {
  // This reference will give us direct access to the mesh
  const mesh = useRef<Mesh>()

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x = mesh.current.rotation.y += 0.01
    }
  })

  return (
    <mesh
      ref={mesh}
      position={position}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

const App = () => (
  <PanWrapper>
    <Canvas colorManagement camera={{ position: [-10, 10, 10], fov: 35 }}>
      <ambientLight />
      <pointLight position={[-10, 10, -10]} castShadow />
      <ReactSpringBox />
    </Canvas>
  </PanWrapper>
);

export default App;

// export default () => (
//   <>
//     <Canvas>
//       <ambientLight />
//       <pointLight position={[10, 10, 10]} />
//       <Box position={[-1.2, 0, 0]} />
//       <Box position={[1.2, 0, 0]} />
//       <OrbitControls />
//     </Canvas>

//     <Canvas colorManagement camera={{ position: [-10, 10, 10], fov: 35 }}>
//       <ambientLight />
//       <pointLight position={[-10, 10, -10]} castShadow />
//       <ReactSpringBox />
//     </Canvas>
//   </>
// );