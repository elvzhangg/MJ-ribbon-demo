import json
import os
import requests
import argparse
from PIL import Image
from io import BytesIO

def download_image(url):
    response = requests.get(url)
    if response.status_code == 200:
        return Image.open(BytesIO(response.content))
    else:
        raise Exception(f"Error downloading image: {response.status_code}")

def resize_image(image, max_size):
    if image.width > max_size or image.height > max_size:
        if image.width > image.height:
            new_width = max_size
            new_height = int(max_size * (image.height / image.width))
        else:
            new_height = max_size
            new_width = int(max_size * (image.width / image.height))
        return image.resize((new_width, new_height), Image.ANTIALIAS)
    else:
        return image

def save_image(image, file_path):
    image.save(file_path)

# Parse command line arguments
parser = argparse.ArgumentParser(description='Download and resize images from JSON data.')
parser.add_argument('input_json', type=str, help='Input JSON file containing image URLs')
parser.add_argument('output_json', type=str, help='Output JSON file to store resized image filenames')
parser.add_argument('output_folder', type=str, help='Output folder to store resized images')

args = parser.parse_args()

# Load data from input JSON file
with open(args.input_json, 'r') as file:
    data = json.load(file)

max_size = 300
saved_images = []

if not os.path.exists(args.output_folder):
    os.makedirs(args.output_folder)

for item in data:
    image_url = item['img_url']
    image_filename = os.path.basename(image_url)
    output_filename = f"{item['id']}_{image_filename}"
    try:
        print(f"Downloading {image_url}...")
        image = download_image(image_url)
        resized_image = resize_image(image, max_size)
        output_path = os.path.join(args.output_folder, output_filename)
        save_image(resized_image, output_path)
        print(f"Image saved to {output_path}")
        saved_images.append({"id": item['id'], "filename": output_filename})
    except Exception as e:
        print(f"Error processing {image_url}: {e}")

# Save the generated image filenames to output JSON file
with open(args.output_json, 'w') as file:
    json.dump(saved_images, file, indent=2)
