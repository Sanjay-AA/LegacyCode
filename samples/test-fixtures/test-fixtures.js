// Test Fixtures for Universal Modernization Engine

export const FIXTURES = {
  jquery: {
    filename: 'app.js',
    code: `$(document).ready(function() {
      var cartCount = 0;
      $('#add-btn').on('click', function(e) {
        e.preventDefault();
        cartCount++;
        $('#cart-badge').text(cartCount).addClass('active');
        $.ajax({ url: '/api/cart', type: 'POST', data: { count: cartCount } });
      });
    });`
  },
  vue: {
    filename: 'CartComponent.vue',
    code: `<template>
      <div className="cart">
        <button @click="incrementCount">Add to Cart: {{ count }}</button>
        <input v-model="username" placeholder="User Name" />
      </div>
    </template>
    <script>
    export default {
      data() { return { count: 0, username: '' }; },
      methods: {
        incrementCount() { this.count++; }
      }
    };
    </script>`
  },
  angular: {
    filename: 'user.component.ts',
    code: `import { Component } from '@angular/core';

    @Component({
      selector: 'app-user',
      template: '<div><h2>User {{ name }}</h2><button (click)="save()">Save</button></div>'
    })
    export class UserComponent {
      name: string = 'John Doe';
      save() { console.log('Saved'); }
    }`
  },
  php: {
    filename: 'register.php',
    code: `<?php
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
      $user = $_POST['user'];
      $conn = mysqli_connect("localhost", "root", "secret", "mydb");
      mysqli_query($conn, "INSERT INTO users (name) VALUES ('$user')");
      echo json_encode(["status" => "success"]);
    }`
  },
  java: {
    filename: 'UserServlet.java',
    code: `package com.app;
    import javax.servlet.http.HttpServlet;
    import javax.servlet.http.HttpServletRequest;
    import javax.servlet.http.HttpServletResponse;

    public class UserServlet extends HttpServlet {
      protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        String username = request.getParameter("username");
      }
    }`
  },
  python: {
    filename: 'app.py',
    code: `from flask import Flask, request, jsonify
    app = Flask(__name__)

    @app.route('/api/users', methods=['POST'])
    def create_user():
        data = request.json
        return jsonify({"status": "created", "user": data})`
  },
  androidJava: {
    filename: 'MainActivity.java',
    code: `package com.example.app;
    import android.app.Activity;
    import android.os.Bundle;
    import android.widget.TextView;

    public class MainActivity extends Activity {
      @Override
      protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView tv = new TextView(this);
        tv.setText("Hello Android");
      }
    }`
  },
  cordova: {
    filename: 'config.xml',
    code: `<?xml version='1.0' encoding='utf-8'?>
    <widget id="com.example.app" version="1.0.0">
      <name>CordovaApp</name>
      <plugin name="cordova-plugin-camera" spec="^4.1.0" />
    </widget>`
  },
  mysqlDDL: {
    filename: 'schema.sql',
    code: `CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`
  },
  sqlDump: {
    filename: 'dump.sql',
    code: `DROP TABLE IF EXISTS products;
    CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(100), price DECIMAL(10,2));
    INSERT INTO products VALUES (1, 'Laptop', 999.99);`
  },
  soapWSDL: {
    filename: 'service.wsdl',
    code: `<?xml version="1.0"?>
    <wsdl:definitions name="UserService" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/">
      <wsdl:message name="GetUserRequest"><wsdl:part name="id" type="xsd:string"/></wsdl:message>
    </wsdl:definitions>`
  },
  shellScript: {
    filename: 'deploy.sh',
    code: `#!/bin/bash
    echo "Deploying application..."
    export PORT=8080
    docker run -d -p 8080:8080 myapp:latest`
  },
  cloudFormation: {
    filename: 'template.yaml',
    code: `AWSTemplateFormatVersion: '2010-09-09'
    Resources:
      MyEC2Instance:
        Type: AWS::EC2::Instance
        Properties:
          InstanceType: t2.micro`
  }
};
