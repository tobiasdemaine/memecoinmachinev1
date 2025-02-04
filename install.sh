#!/bin/bash

# Function to check and install a command
install_if_missing() {
    if ! command -v $1 &> /dev/null
    then
        echo "Installing $1..."
        eval "$2"
    else
        echo "$1 is already installed."
    fi
}


# Update package list and install Python
sudo apt update
sudo apt install -y python3 python3-pip python3-venv 

python3 -m venv .venv
source .venv/bin/activate
# Install required Python libraries
pip3 install solana
pip3 install ndg-httpsclient
pip3 install requests
pip3 install pyopenssl
pip3 install pyasn1

# Verify installation
python3 --version
pip3 --version

# Install Rust
install_if_missing rustc "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
rustc -V
rustup update

# Install Solana CLI
install_if_missing solana "sh -c \"\$(curl -sSfL https://release.anza.xyz/stable/install)\" && export PATH=\"\$HOME/.local/share/solana/install/active_release/bin:\$PATH\""

# Verify Solana installation
solana --version

# Install SPL Token CLI
install_if_missing spl-token "cargo install spl-token-cli"

# Verify SPL Token CLI installation
spl-token --version

# Install Node.js and Yarn (Required for Metaplex CLI)
install_if_missing node "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"  # Ubuntu/Debian
install_if_missing yarn "npm install -g yarn"

echo "Installation complete! Please restart your terminal or run:"
echo "export PATH=\"\$HOME/.local/share/solana/install/active_release/bin:\$PATH\""

# Create directory "./tokens" if it does not exist
if [ ! -d "./tokens" ]; then
    mkdir ./tokens
    echo "Directory ./tokens created."
else
    echo "Directory ./tokens already exists."
fi
