<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateIgnoreListTable extends Migration
{
    public function up()
    {
        Schema::create('ignore_list', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('item_id'); // Change this line
            $table->timestamps();

            $table->unique(['user_id', 'item_id']); // Composite unique index
        });
    }
    

    public function down()
    {
        Schema::dropIfExists('ignore_list');
    }
}
