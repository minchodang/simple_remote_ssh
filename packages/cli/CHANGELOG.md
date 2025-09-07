# simple-remote-ssh

## 0.1.1

### Patch Changes

- e499e1f: # 🎉 Simple Remote SSH v0.1.0 - Initial Release

  ## ✨ Key Features

  ### SSH Host Management

  - **Add Host**: `simple-ssh add` - Interactive host information input
  - **List Hosts**: `simple-ssh list` - View saved host list
  - **Edit Host**: `simple-ssh edit <hostname>` - Modify host information
  - **Remove Host**: `simple-ssh remove <hostname>` - Delete host

  ### SSH Connection

  - **Interactive Connection**: `simple-ssh` - Select and connect to host
  - **Direct Connection**: `simple-ssh connect <hostname>` - Connect directly to specific host
  - **Connection Options**: Username and port override support

  ### Authentication Methods

  - **SSH Key File**: Secure key-based authentication
  - **Password**: Interactive password input on connection
  - **Default SSH Settings**: Use system default SSH configuration

  ### Additional Features

  - **Tag System**: Host categorization and management
  - **Description Field**: Per-host notes
  - **Colorful UI**: Intuitive user interface

  ## 🚀 Installation & Usage

  ```bash
  # Global installation
  npm install -g simple-remote-ssh

  # Usage
  simple-ssh --help
  ```

  ## 💾 Configuration File

  Host information is securely stored in `~/.ssh-easy/config.json`.
