from PIL import Image
import numpy as np

# Load images
original = Image.open("image.png")
encoded = Image.open("encoded.png")

orig = np.array(original)
enc = np.array(encoded)

# Find changed pixels
mask = np.any(orig != enc, axis=2)

# Convert mask to visible image (white where changed)
diff = mask.astype(np.uint8) * 255

# Resize to zoom (IMPORTANT)
diff_image = Image.fromarray(diff)
diff_image = diff_image.resize((800, 800))  # zoomed view

diff_image.save("difference.png")

# Stats
changed = np.sum(mask)
total = mask.size

print("Changed pixels:", changed)
print("Total pixels:", total)
print("Difference image saved as difference.png")