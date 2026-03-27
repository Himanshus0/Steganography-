from PIL import Image

def message_to_binary(message):
    return ''.join(format(ord(i), '08b') for i in message)

def encode_image(image_path, message, output_path):
    img = Image.open(image_path)
    pixels = img.load()

    binary_message = message_to_binary(message) + "1111111111111110"
    data_index = 0

    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]

            if data_index < len(binary_message):
                r = (r & ~1) | int(binary_message[data_index])
                data_index += 1

            if data_index < len(binary_message):
                g = (g & ~1) | int(binary_message[data_index])
                data_index += 1

            if data_index < len(binary_message):
                b = (b & ~1) | int(binary_message[data_index])
                data_index += 1

            pixels[x, y] = (r, g, b)

            if data_index >= len(binary_message):
                break
        if data_index >= len(binary_message):
            break

    img.save(output_path)
    print("Message hidden successfully!")

msg = input("Enter secret message: ")
encode_image("image.png", msg, "encoded.png")