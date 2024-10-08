import React, { useState } from 'react';
import { View, Button, Dimensions } from 'react-native';
import { Canvas, useCanvasRef, Skia, Paint, Rect, Image as SkiaImage, Text as SkiaText, useImage, matchFont } from '@shopify/react-native-skia';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
 
// Custom aspect ratio (e.g., 4:5)
const ASPECT_RATIO = 1.9;
 
const App = () => {
  const canvasRef = useCanvasRef();
  const [snapshotData, setSnapshotData] = useState(null);
 
  // Get screen width for dynamic scaling
  const { width: screenWidth } = Dimensions.get('window');
  const canvasWidth = screenWidth - 40; // Add padding if needed
  const canvasHeight = canvasWidth / ASPECT_RATIO; // Maintain custom aspect ratio
 
  // Elements array containing multiple texts and images
  const elements = [
    {
      type: 'text',
      content: 'Hello, World!',
      posX: 0.5, // 50% of canvas width
      posY: 0.1, // 10% of canvas height
      fontSize: 0.05, // 5% of canvas width
      color: 'blue'
    },
    {
      type: 'image',
      src: 'https://user-images.githubusercontent.com/306134/146549218-b7959ad9-0107-4c1c-b439-b96c780f5230.png',
      posX: 0.5, // 50% of canvas width
      posY: 0.5, // 50% of canvas height
      width: 0.2, // 20% of canvas width
      height: 0.3 // 30% of canvas height
    }
  ];
 
  const paintFill = Skia.Paint();
  paintFill.setColor(Skia.Color('grey')); // Fill color for the inner rectangle
 
  // Function to create a snapshot of the canvas as an image and encode it in PNG format
  const handleCaptureCanvas = () => {
    const imageSnapshot = canvasRef.current.makeImageSnapshot();
 
    if (imageSnapshot) {
      // Convert the snapshot to PNG (base64 encoded)
      const base64String = imageSnapshot.encodeToBase64(1);
 
      // Store the base64 image data in the state for sharing
      setSnapshotData(`data:image/jpeg;base64,${base64String}`);
    }
  };
 
  // Function to share the captured canvas image
  const handleShare = async () => {
    try {
      if (!snapshotData) {
        return;
      }
 
      // Define a filename (e.g., 'shared_image.png')
      const filePath = `${RNFS.CachesDirectoryPath}/shared_image.jpeg`;
 
      // Write the base64 image to the file system
      await RNFS.writeFile(filePath, snapshotData.replace('data:image/jpeg;base64,', ''), 'base64');
 
      // Prepare the share options with the file URI
      const shareOptions = {
        title: 'Share Image',
        url: `file://${filePath}`, // Share the file from the cache directory
        type: 'image/jpeg',
        filename: 'shared_image.jpeg', // Optional, but helpful
      };
 
      // Open the share dialog
      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };
 
  const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
  const fontStyle = {
    fontFamily,
    fontSize: 14, // Default font size for the canvas
    fontStyle: "italic",
    fontWeight: "bold",
  };
  const font = matchFont(fontStyle);
 
  return (
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
<Canvas ref={canvasRef} style={{ width: canvasWidth, height: canvasHeight }}>
        {/* Inner filled rectangle */}
<Rect x={0} y={0} width={canvasWidth} height={canvasHeight} paint={paintFill} />
 
        {/* Loop through elements array and render text and images dynamically */}
        {elements.map((element, index) => {
          if (element.type === 'text') {
            return (
<SkiaText
                key={index}
                x={element.posX * canvasWidth - (element.fontSize * canvasWidth * element.content.length) / 4} // Center text horizontally
                y={element.posY * canvasHeight}
                text={element.content}
                fontSize={element.fontSize * canvasWidth} // Font size based on canvas width
                color={element.color}
                font={font}
              />
            );
          } else if (element.type === 'image') {
            const image = useImage(element.src);
            return image ? (
<SkiaImage
                key={index}
                image={image}
                x={element.posX * canvasWidth - (element.width * canvasWidth) / 2} // Centered horizontally
                y={element.posY * canvasHeight - (element.height * canvasHeight) / 2} // Centered vertically
                width={element.width * canvasWidth}
                height={element.height * canvasHeight}
              />
            ) : null;
          }
        })}
</Canvas>
<Button title="Capture Canvas" onPress={handleCaptureCanvas} />
<Button title="Share Canvas" onPress={handleShare} />
</View>
  );
};
 
export default App;