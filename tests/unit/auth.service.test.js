
import { signupUser } from "../../src/services/auth.service.js"
import { pool } from "../../src/config/db.js"



describe("Auth Service - signup user",()=>{
    it("creates a user with hashed password",async()=>{
        const email="test2@example.com"
        const password="password123"

        const newUser=await signupUser({email,password})
        
        //find hashed password in the database
        const {rows}=await pool.query("SELECT password_hash from users where email=$1",[email])
        const password_hash=rows[0].password_hash

        expect(newUser).toBeDefined()
        expect(newUser.email).toBe(email)
        expect(password_hash).toBeDefined()
        expect(password_hash).not.toBe(password)

    })
})