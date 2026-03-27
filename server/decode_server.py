"""
decode_server.py — server-side decode script
Called by the Node route with args: <encoded_image>
Prints the hidden message to stdout.
Exits 0 on success, 1 on failure.
"""
import sys
from PIL import Image

def decode_image(image_path):
    try:
        img = Image.open(image_path).convert('RGB')
    except Exception as e:
        print(f"Cannot open image: {e}", file=sys.stderr)
        sys.exit(1)

    pixels = img.load()
    width, height = img.size
    binary_data = ""

    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            binary_data += str(r & 1)
            binary_data += str(g & 1)
            binary_data += str(b & 1)

    all_bytes = [binary_data[i:i+8] for i in range(0, len(binary_data), 8)]

    message = ""
    i = 0
    while i < len(all_bytes):
        byte = all_bytes[i]
        # Check for 16-bit delimiter 1111111111111110
        if i + 1 < len(all_bytes) and byte + all_bytes[i+1] == "1111111111111110":
            break
        if byte == "11111111" and i + 1 < len(all_bytes) and all_bytes[i+1] == "11111110":
            break
        try:
            char = chr(int(byte, 2))
            message += char
        except Exception:
            break
        i += 1

    if not message:
        print("No hidden message found or image is not encoded.", file=sys.stderr)
        sys.exit(1)

    print(message, end="")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: decode_server.py <encoded_image>", file=sys.stderr)
        sys.exit(1)
    decode_image(sys.argv[1])
