# Nouners Scripts

This directory contains utility scripts for Nouners.

## Fork Notice

Nouners is a fork of the Nouns Camp project, aimed at experimenting with new features and improvements. We appreciate and credit the original Nouns Camp contributors.

## Contributions

Community contributions are welcome. If you have ideas for new scripts or enhancements, please open an issue or a pull request.

## License

Scripts in this directory are covered by the repository’s GPL-3.0 license. See the root `LICENSE` file for details.

## Available Scripts

### Client Activity Report Generator

```bash
# Usage
node generate-client-activity-report.js --start TIMESTAMP --end TIMESTAMP [--output FILE]

# Options
#   --start      Start timestamp (Unix epoch)
#   --end        End timestamp (Unix epoch)
#   --output     Output file path (default: ../reports/client-activity-report.txt)

# Example
node generate-client-activity-report.js --start 1740833138 --end 1743421540
node generate-client-activity-report.js --start 1740833138 --end 1743421540 --output ../reports/march-2025-activity.txt
```
