# simple-remote-ssh

## 0.2.0

### Minor Changes

-   add auto complete mode with test code

## 0.1.3

### Patch Changes

-   8a321a2: # 🧪 Test Infrastructure Improvements

    ## ✅ Testing Enhancements

    ### Complete Unit Test Suite

    -   **SSH Host Types**: Comprehensive type validation tests
    -   **Config Management**: Full coverage for host CRUD operations
    -   **Environment Isolation**: Fixed test interference issues

    ### Development Experience

    -   **Build-free Testing**: Direct TypeScript execution with `tsx`
    -   **Fast Feedback**: No compilation step needed for unit tests
    -   **Reliable Tests**: All 15 tests passing consistently

    ### Technical Improvements

    -   **Environment Isolation**: Fixed config path resolution for test independence
    -   **Test Reliability**: Each test runs in isolated temporary directory
    -   **Better Assertions**: More flexible and accurate test validations

    ## 🛠️ Infrastructure

    -   Added Vitest configuration with TypeScript support
    -   Configured test scripts for different scenarios
    -   Added comprehensive test fixtures and utilities

    This release improves development workflow and code quality without changing user-facing functionality.

## 0.1.2

### Patch Changes

-   github url update and config fix

## 0.1.1

### Patch Changes

-   e499e1f: # 🎉 Simple Remote SSH v0.1.0 - Initial Release

    ## ✨ Key Features

    ### SSH Host Management

    -   **Add Host**: `simple-ssh add` - Interactive host information input
    -   **List Hosts**: `simple-ssh list` - View saved host list
    -   **Edit Host**: `simple-ssh edit <hostname>` - Modify host information
    -   **Remove Host**: `simple-ssh remove <hostname>` - Delete host

    ### SSH Connection

    -   **Interactive Connection**: `simple-ssh` - Select and connect to host
    -   **Direct Connection**: `simple-ssh connect <hostname>` - Connect directly to specific host
    -   **Connection Options**: Username and port override support

    ### Authentication Methods

    -   **SSH Key File**: Secure key-based authentication
    -   **Password**: Interactive password input on connection
    -   **Default SSH Settings**: Use system default SSH configuration

    ### Additional Features

    -   **Tag System**: Host categorization and management
    -   **Description Field**: Per-host notes
    -   **Colorful UI**: Intuitive user interface

    ## 🚀 Installation & Usage

    ```bash
    # Global installation
    npm install -g simple-remote-ssh

    # Usage
    simple-ssh --help
    ```

    ## 💾 Configuration File

    Host information is securely stored in `~/.ssh-easy/config.json`.
