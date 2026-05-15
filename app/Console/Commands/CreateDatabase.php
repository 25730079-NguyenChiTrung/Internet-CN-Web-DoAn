<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class CreateDatabase extends Command
{
    protected $signature = 'db:create';

    protected $description = 'Create the database specified in DB_DATABASE if it does not already exist';

    public function handle(): int
    {
        $database = config('database.connections.mysql.database');
        $charset = config('database.connections.mysql.charset', 'utf8mb4');
        $collation = config('database.connections.mysql.collation', 'utf8mb4_unicode_ci');

        // Connect without selecting a database so we can run CREATE DATABASE
        config(['database.connections.mysql.database' => null]);
        DB::reconnect('mysql');

        try {
            DB::statement(
                "CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET {$charset} COLLATE {$collation}"
            );
        } catch (Throwable $e) {
            $this->error("Could not connect to MySQL: {$e->getMessage()}");
            $this->newLine();
            $this->line('  Make sure MySQL is running before executing this command.');
            $this->line('  → XAMPP: open the Control Panel and start <fg=yellow>MySQL</>');

            return self::FAILURE;
        }

        $this->info("Database `{$database}` is ready.");

        // Restore the database name for any subsequent commands in the same process
        config(['database.connections.mysql.database' => $database]);
        DB::reconnect('mysql');

        return self::SUCCESS;
    }
}
