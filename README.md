## Features

- Add, edit, and delete tasks using AI-powered suggestions
- Natural language input for creating tasks
- Smart categorization and prioritization
- Reminders and notifications
- Cross-platform support
## .env Example

Create a `.env` file in the project root with the following content:

```env
# Example environment variables
OPENAI_API_KEY=your_openai_api_key_here
NOTIFICATION_SERVICE_KEY=your_notification_service_key_here
DATABASE_URL=your_database_url_here
```

## Drizzle ORM Usage

This project uses [Drizzle ORM](https://orm.drizzle.team/) for database management. Make sure to set the `DATABASE_URL` variable in your `.env` file as shown above.

Drizzle commands can be found in the `package.json` scripts section. Common commands include:

```bash
# Generate Drizzle client
npm run drizzle:generate

# Run migrations
npm run drizzle:migrate
```
## Getting Started

1. Clone the repository:
    ```bash
    git clone git@github.com:rehanulHaque/ai-todo-cli.git
    ```
2. Install dependencies:
    ```bash
    cd ai-todo
    npm install
    ```
3. Start the application:
    ```bash
    npm run dev
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
