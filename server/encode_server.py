"""
encode_server.py — server-side encode script
Called by the Node route with args: <input_image> <message> <output_image>
Exits 0 on success, 1 on failure (stderr contains the error).
"""
import sys
import os
from PIL import Image

def message_to_binary(message):
    return ''.join(format(ord(c), '08b') for c in message)

def encode_image(image_path, message, output_path):
    try:
        img = Image.open(image_path).convert('RGB')
    except Exception as e:
        print(f"Cannot open image: {e}", file=sys.stderr)
        sys.exit(1)

    # Delimiter: 16-bit sequence 1111111111111110
    binary_message = message_to_binary(message) + "1111111111111110"
    width, height = img.size

    if len(binary_message) > width * height * 3:
        print("Message too long for this image.", file=sys.stderr)
        sys.exit(1)

    # --- Draw highly visible marker around the hidden region! ---
    # Because for short messages, the tinted pixels are microscopically small
    pixels_needed = (len(binary_message) + 2) // 3
    y_end = (pixels_needed - 1) // width
    x_end = (pixels_needed - 1) % width
    
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    # Ensure the box is at least 30x30 so it's fully visible even for 1-letter messages
    box_right = max(30, width - 1 if y_end > 0 else x_end + 15)
    box_bottom = max(30, y_end + 15)
    
    # Draw a bright red, 5-pixel thick bounding box outlining where the data is!
    draw.rectangle([0, 0, box_right, box_bottom], outline=(255, 0, 0), width=5)
    # -----------------------------------------------------------

    pixels = img.load()

    data_index = 0
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            
            # Watermark exactly where the message is hidden!
            if data_index < len(binary_message):
                # Apply a neon-green overlay to make the data trace immediately obvious
                r = int(r * 0.3)
                g = min(255, int(g * 0.3 + 200)) # Neon green
                b = int(b * 0.3)

            if data_index < len(binary_message):
                r = (r & ~1) | int(binary_message[data_index]); data_index += 1
            if data_index < len(binary_message):
                g = (g & ~1) | int(binary_message[data_index]); data_index += 1
            if data_index < len(binary_message):
                b = (b & ~1) | int(binary_message[data_index]); data_index += 1
            pixels[x, y] = (r, g, b)
            if data_index >= len(binary_message):
                break
        if data_index >= len(binary_message):
            break

    img.save(output_path, format='PNG')
    print("OK")

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: encode_server.py <input> <message> <output>", file=sys.stderr)
        sys.exit(1)
    encode_image(sys.argv[1], sys.argv[2], sys.argv[3])
