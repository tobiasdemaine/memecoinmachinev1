import os
import sys
import json
import shutil
import subprocess
import requests
import re


def regenerateSite(json_file_path):
    # Load JSON file
    with open(json_file_path, 'r') as f:
        data = json.load(f)

    # Copy media files
    media_src_dir = './tokens/media'
    media_dest_dir = './reactApp/token/public/images'
    basename = os.path.splitext(os.path.basename(json_file_path))[0]
    os.makedirs(media_dest_dir, exist_ok=True)
    shutil.copy(os.path.join(media_src_dir, f'{basename}_hero.png'), os.path.join(media_dest_dir, 'hero.png'))
    shutil.copy(os.path.join(media_src_dir, f'{basename}_logo.png'), os.path.join(media_dest_dir, 'logo.png'))
    # Copy document.pdf
    pdf_src_path = os.path.join(media_src_dir, f'{basename}_document.pdf')
    pdf_dest_path = './reactApp/token/public/pdf/document.pdf'
    os.makedirs(os.path.dirname(pdf_dest_path), exist_ok=True)
    shutil.copy(pdf_src_path, pdf_dest_path)


    # Copy JSON file's website parameter to a specific location
    website_data = data['website']
    website_data_path = './reactApp/token/src/data/data.json'
    os.makedirs(os.path.dirname(website_data_path), exist_ok=True)
    with open(website_data_path, 'w') as f:
        json.dump(website_data, f, indent=4)

    # Update <title> tag in index.html
    index_html_path = './reactApp/token/index.html'
    with open(index_html_path, 'r') as f:
        index_html_content = f.read()
    index_html_content = re.sub(r'<title>.*?</title>', f'<title>{website_data["symbol"]}</title>', index_html_content)
    with open(index_html_path, 'w') as f:
        f.write(index_html_content)


    # Build the React app
    os.chdir('./reactApp/token')
    subprocess.run(['npm', 'run', 'build'])

    # Copy build directory to a specified location
    
    build_src_dir = 'dist'
    build_dest_dir = f'../../tokens/sites/{os.path.splitext(os.path.basename(json_file_path))[0]}'
    if os.path.exists(build_dest_dir):
        shutil.rmtree(build_dest_dir)
    shutil.copytree(build_src_dir, build_dest_dir)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python script.py <path_to_json_file>")
        sys.exit(1)
    json_file_path = sys.argv[1]
    regenerateSite(json_file_path)