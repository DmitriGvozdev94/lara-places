<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IgnoreList extends Model
{
    use HasFactory;

    protected $table = 'ignore_list';

    protected $fillable = [
        'user_id',
        'item_id',
    ];
}
