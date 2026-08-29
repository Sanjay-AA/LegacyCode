package com.legacy.app;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.DriverManager;
import java.sql.Connection;

public class LegacyUserServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String username = request.getParameter("username");
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/db", "root", "secret");
            // Raw JDBC Statement
        } catch (Exception e) {
            response.setStatus(500);
        }
    }
}
