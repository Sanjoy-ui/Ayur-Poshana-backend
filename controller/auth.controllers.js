import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import { sendOtpMail } from "../utils/mail.js"
import genToken from "../utils/token.js"

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password,role } = req.body
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "user Already exist" })
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'password must be at least 6 characters' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        user = await User.create({
            fullName,
            email,
            role,
            password: hashedPassword
        })

        const token = await genToken(user._id)

        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(201).json(user)
    } catch (error) {
        return res.status(500).json(`sign up error ${error}`)
    }
}


export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "user does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "incorrect password" })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json(`sign in error ${error}`)
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "logged out error" })
    } catch (error) {
        return res.status(500).json(`sign out error ${error}`)
    }
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "user does not exist" })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        user.resetOtp = otp
        user.otpExpires = Date.now() + 5 * 60 * 1000
        user.isOtpVerified = false
        await user.save()
        await sendOtpMail(email, otp)
        return res.status(200).json({ message: "otp send successfull" })
    } catch (error) {
        return res.status(500).json(`send otp error ${error}`)
    }
}

export const verifyotp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })
        if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
            res.status(400).json({ message: "invalid/expired otp" })
        }
        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined
        await user.save()
        return res.status(200).json({ message: "otp verify successfull" })
    } catch (error) {
        return res.status(500).json(`varify otp error ${error}`)
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body
        const user = await User.findOne({ email })
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "otp varification required" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword
        user.isOtpVerified = false
        await user.save()
        return res.status(200).json({ message: "password reset successfull" })
    } catch (error) {
        return res.status(500).json(`reset password error ${error}`)
    }
}

export const googleAuth = async(req,res)=>{
    try {
        const {fullName,email,role} = req.body
        let user = await User.findOne({email})
        if(!user){
            user = await User.create({
                fullName,email,role
            })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        })

        return res.status(200).json(user)

    } catch (error) {
            return res.status(500).json(`google auth error ${error}`)
    }
}