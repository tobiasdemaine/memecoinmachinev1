import os
import sys
import json
import shutil
import subprocess
import requests
import re

def upload_to_ipfs(file_path):
    url = 'https://ipfs.infura.io:5001/api/v0/add'
    api_key = 'ede495de652e448c9706cf5b05ebd1d1'
    api_secret = '618fbfcf4b094259994e42a8eb7eb137'
    headers = {
        'Authorization': f'Basic {api_key}:{api_secret}'
    }
    with open(file_path, 'rb') as f:
        response = requests.post(url, files={'file': f}, headers=headers)
    return response.json()['Hash']

def main(json_file_path):
    # Load JSON file
    with open(json_file_path, 'r') as f:
        data = json.load(f)

    # Copy media files
    media_src_dir = os.path.join(os.path.dirname(json_file_path), 'media')
    media_dest_dir = '../reactApp/token/public/images'
    basename = {os.path.splitext(os.path.basename(json_file_path))[0]}
    os.makedirs(media_dest_dir, exist_ok=True)
    shutil.copy(os.path.join(media_src_dir, f'{basename}_hero.png'), os.path.join(media_dest_dir, 'hero.png'))
    shutil.copy(os.path.join(media_src_dir, f'{basename}_logo.png'), os.path.join(media_dest_dir, 'logo.png'))
    # Copy document.pdf
    pdf_src_path = os.path.join(media_src_dir, f'{basename}_document.pdf')
    pdf_dest_path = '../reactApp/token/public/pdf/document.pdf'
    os.makedirs(os.path.dirname(pdf_dest_path), exist_ok=True)
    shutil.copy(pdf_src_path, pdf_dest_path)
    # Upload logo.png to IPFS
    ipfs_logo_link = upload_to_ipfs(os.path.join(media_dest_dir, 'logo.png'))
    data['metaData']['image'] = f'https://ipfs.infura.io/ipfs/{ipfs_logo_link}'

    # Save updated JSON file
    with open(json_file_path, 'w') as f:
        json.dump(data, f, indent=4)

    # Upload JSON file to IPFS
    ipfs_json_link = upload_to_ipfs(json_file_path)
    data['ipfsLogoLink'] = f'https://ipfs.infura.io/ipfs/{ipfs_logo_link}'
    data['ipfsJsonLink'] = f'https://ipfs.infura.io/ipfs/{ipfs_json_link}'

    # Save updated JSON file again
    with open(json_file_path, 'w') as f:
        json.dump(data, f, indent=4)

    # Copy JSON file's website parameter to a specific location
    website_data = data['website']
    website_data_path = '../reactApp/token/src/data/data.json'
    os.makedirs(os.path.dirname(website_data_path), exist_ok=True)
    with open(website_data_path, 'w') as f:
        json.dump(website_data, f, indent=4)

    # Update <title> tag in index.html
    index_html_path = '../reactApp/token/index.html'
    with open(index_html_path, 'r') as f:
        index_html_content = f.read()
    index_html_content = re.sub(r'<title>.*?</title>', f'<title>{website_data["title"]}</title>', index_html_content)
    with open(index_html_path, 'w') as f:
        f.write(index_html_content)

    # Build the React app
    os.chdir('../reactApp/token')
    subprocess.run(['npm', 'run', 'build'])

    # Copy build directory to a specified location
    build_src_dir = 'build'
    build_dest_dir = f'../../tokens/sites/{os.path.splitext(os.path.basename(json_file_path))[0]}'
    shutil.copytree(build_src_dir, build_dest_dir)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python script.py <path_to_json_file>")
        sys.exit(1)
    json_file_path = sys.argv[1]
    main(json_file_path)