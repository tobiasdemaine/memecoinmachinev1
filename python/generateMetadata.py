import os
import sys
import json
import shutil
import subprocess

def upload_to_ipfs(file_path):
    url = 'https://ipfs.infura.io:5001/api/v0/add'
    api_key = 'ede495de652e448c9706cf5b05ebd1d1'
    api_secret = '618fbfcf4b094259994e42a8eb7eb137'
    command = [
        'curl', '-X', 'POST', '-F', f'file=@{file_path}',
        '-u', f'{api_key}:{api_secret}', url
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    return json.loads(result.stdout)['Hash']

def generateMetaData(json_file_path):
    # Load JSON file
    with open(json_file_path, 'r') as f:
        data = json.load(f)

    # Copy media files
    media_src_dir = './tokens/media'
    media_dest_dir = './reactApp/token/public/images'
    meta_dest_dir = './reactApp/token/public/'
    basename = os.path.splitext(os.path.basename(json_file_path))[0]
    os.makedirs(media_dest_dir, exist_ok=True)
    hero_image_path = os.path.join(media_src_dir, f'{basename}_hero.png')
    if os.path.exists(hero_image_path):
        shutil.copy(hero_image_path, os.path.join(media_dest_dir, 'hero.png'))
    shutil.copy(os.path.join(media_src_dir, f'{basename}_logo.png'), os.path.join(media_dest_dir, 'logo.png'))

    # Upload logo.png to IPFS
    domain = data["domain"]
    ipfs_logo_link = upload_to_ipfs(os.path.join(media_src_dir, f'{basename}_logo.png'))
    #data['metaData']['image'] = f'https://{domain}/images/logo.png'
    data['metaData']['image'] = f'https://ipfs.io/ipfs/{ipfs_logo_link}'
    meta_dest_path = f'./tokens/{basename}_META.json'
    # Save updated JSON file
    with open(meta_dest_path, 'w') as f:
        json.dump(data['metaData'], f, indent=4)

    # Upload JSON file to IPFS
    ipfs_json_link = upload_to_ipfs(meta_dest_path)
    shutil.copy(meta_dest_path, os.path.join(meta_dest_dir, 'meta.json'))
    #data['ipfsLogoLink'] = f'https://{domain}/images/logo.png'
    #data['ipfsJsonLink'] = f'https://{domain}/meta.json'
    data['ipfsLogoLink'] = f'https://ipfs.io/ipfs/{ipfs_logo_link}'
    data['ipfsJsonLink'] = f'https://ipfs.io/ipfs/{ipfs_json_link}'

     # Save updated JSON file
    with open(json_file_path, 'w') as f:
        json.dump(data, f, indent=4)
   

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python script.py <path_to_json_file>")
        sys.exit(1)
    json_file_path = sys.argv[1]
    generateMetaData(json_file_path)