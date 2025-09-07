# Simple Remote SSH - Easy SSH Connection Tool

🚀 Simplify complex SSH connections! A CLI tool for storing and easily managing SSH hosts.

## Features

-   🔗 **Easy Connection**: Connect to saved hosts with a single command
-   📋 **Host Management**: Add, edit, and delete SSH hosts
-   🎯 **Interactive Interface**: Intuitive host selection
-   🏷️ **Tag System**: Organize hosts with tags
-   🔑 **SSH Key Support**: Automatic SSH key file management
-   ⚡ **Quick Access**: Short commands with `simple-ssh`
-   🤖 **Auto Commands**: Execute commands automatically on connection

## Installation

```bash
# Install globally from npm
npm install -g simple-remote-ssh

# Or install for development (from current directory)
cd packages/cli
npm link
```

## Usage

### Basic Commands

```bash
# Show help
simple-ssh --help

# List saved hosts
simple-ssh list
simple-ssh ls

# Add new host
simple-ssh add
simple-ssh a

# Connect to host (interactive selection)
simple-ssh
simple-ssh connect

# Connect to specific host
simple-ssh connect my-server
simple-ssh c my-server

# Edit host
simple-ssh edit my-server
simple-ssh e my-server

# Remove host
simple-ssh remove my-server
simple-ssh rm my-server
```

### Connection Options

```bash
# Connect with specific user
simple-ssh connect my-server --user root
simple-ssh c my-server -u root

# Connect with specific port
simple-ssh connect my-server --port 2222
simple-ssh c my-server -p 2222

# Connect with both user and port
simple-ssh connect my-server -u admin -p 2222
```

## Adding Host Example

```bash
$ simple-ssh add

➕ Add New SSH Host

? Host name (alias): my-server
? Host address (IP or domain): 192.168.1.100
? Username: ubuntu
? Port number: 22
? Authentication method: SSH Key
? SSH key file path: ~/.ssh/id_rsa
? Description (optional): Development server
? Tags (comma separated, optional): dev, ubuntu
? Do you want to add auto-commands? Yes
? Enter commands to run on connect: cd /var/log && powershell -Command "Get-Content -Path admin.log -Tail 10 -Wait"

✅ Host added successfully!

📋 Host Information:
   Name: my-server
   Address: ubuntu@192.168.1.100:22
   Auth: SSH Key (~/.ssh/id_rsa)
   Description: Development server
   Tags: dev, ubuntu
   Auto Commands: 1 command configured

💡 To connect: simple-ssh connect my-server
```

## Host List Example

```bash
$ simple-ssh list

📋 Saved SSH Hosts:

1. my-server ubuntu@192.168.1.100:22 - Development server [dev, ubuntu]
   🔑 Auth: SSH Key (~/.ssh/id_rsa)
   🤖 Auto Commands: 1 configured
2. prod-server root@prod.example.com:22 - Production server [prod]
   🔒 Auth: Password
3. test-db admin@test-db.local:3306 - Test database [test, database]
   ⚙️  Auth: Default SSH settings

Total: 3 hosts saved.

💡 Usage:
  Connect: simple-ssh connect <hostname> or simple-ssh c <hostname>
  Edit: simple-ssh edit <hostname> or simple-ssh e <hostname>
  Remove: simple-ssh remove <hostname> or simple-ssh rm <hostname>
```

## Configuration File

Host information is stored in `~/.simple-ssh/config.json`.

```json
{
    "hosts": [
        {
            "name": "my-server",
            "host": "192.168.1.100",
            "user": "ubuntu",
            "port": 22,
            "keyPath": "~/.ssh/id_rsa",
            "description": "Development server",
            "tags": ["dev", "ubuntu"],
            "autoCommands": ["cd /var/log", "powershell -Command \"Get-Content -Path admin.log -Tail 10 -Wait\""]
        }
    ],
    "defaultUser": "ubuntu",
    "defaultPort": 22
}
```

## Development

```bash
# Install dependencies
pnpm install

# Development mode (watch)
pnpm dev

# Build
pnpm build

# Link globally
npm link

# Run tests
pnpm test
```

## License

MIT
