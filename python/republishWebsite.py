import os
import sys
import json
import tarfile
import paramiko

def compress_directory(source_dir, output_filename):
    with tarfile.open(output_filename, "w:gz") as tar:
        tar.add(source_dir, arcname=os.path.basename(source_dir))

def upload_and_unpack(ip_address, username, password, local_file, remote_dir):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(ip_address, username=username, password=password)

    sftp = ssh.open_sftp()
    remote_file = os.path.basename(local_file)
    print(remote_file, local_file, remote_dir)
    sftp.put(local_file, remote_file)
    sftp.close()

    ssh.exec_command(f"mkdir -p {remote_dir}")
    ssh.exec_command(f"tar -xzf {remote_file} -C {remote_dir}")
    ssh.exec_command(f"rm {remote_file}")
    ssh.close()


def republishWebsite(json_file_path):
    with open(json_file_path, 'r') as f:
        data = json.load(f)

    mode = data['mode']
    ticker = data['metaData']['symbol']
    domain = data['domain']
    ip_address = data['ip4']
    username = data['ssh_user'] # Adjust as needed
    password = data['ssh_password']  # Adjust as needed

    source_dir = f"./tokens/sites/{mode}_{ticker}"
    output_filename = f"{mode}_{ticker}.tar.gz"

    compress_directory(source_dir, output_filename)
    upload_and_unpack(ip_address, username, password, output_filename, f"/root/tokens")
    os.remove(output_filename)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python script.py <path_to_json_file>")
        sys.exit(1)
    json_file_path = sys.argv[1]
    republishWebsite(json_file_path)