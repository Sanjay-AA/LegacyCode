package com.legacy.mobile;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class LegacyMainActivity extends AppCompatActivity {
    private int count = 0;
    private TextView countTv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        countTv = findViewById(R.id.tv_count);
        Button incBtn = findViewById(R.id.btn_inc);

        incBtn.setOnClickListener(v -> {
            count++;
            countTv.setText("Count: " + count);
        });
    }
}
