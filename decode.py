from PIL import Image

def decode_image(image_path):
    img = Image.open(image_path)
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
    for byte in all_bytes:
        if byte == "11111110":
            break
        message += chr(int(byte, 2))

    print("Hidden message:", message)

decode_image("encoded.png")