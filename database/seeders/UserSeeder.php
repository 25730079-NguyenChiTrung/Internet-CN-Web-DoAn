<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@uit.edu.vn',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'balance' => 0,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $users = [
            ['name' => 'Nguyễn Văn A', 'email' => 'user1@uit.edu.vn', 'balance' => 100_000_000],
            ['name' => 'Trần Thị B', 'email' => 'user2@uit.edu.vn', 'balance' => 50_000_000],
            ['name' => 'Lê Văn C', 'email' => 'user3@uit.edu.vn', 'balance' => 200_000_000],
            ['name' => 'Phạm Thị D', 'email' => 'user4@uit.edu.vn', 'balance' => 0],
            ['name' => 'Hoàng Văn E', 'email' => 'user5@uit.edu.vn', 'balance' => 75_000_000, 'is_active' => false],
        ];

        foreach ($users as $userData) {
            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('password'),
                'role' => 'user',
                'balance' => $userData['balance'],
                'is_active' => $userData['is_active'] ?? true,
                'email_verified_at' => now(),
            ]);
        }
    }
}
