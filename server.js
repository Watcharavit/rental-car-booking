const express = require("express")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db")
const morgan = require("morgan")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const xss = require("xss-clean")
const rateLimit = require("express-rate-limit")
const hpp = require("hpp")

//Load env vars
dotenv.config({ path: "./config/config.env" })

//Connect to database
connectDB()

//Route files
const provider = require("./routes/provider")
const auth = require("./routes/auth")
const rental = require("./routes/rental")

const app = express()

//Body parser
app.use(express.json())

//Cookie parser
app.use(cookieParser())

app.use(mongoSanitize())
// Set security header
app.use(helmet())
// prevent xss(cross site scripting) attacks
app.use(xss())
// rate limit
const limiter = rateLimit({
	windowsMs: 10 * 60 * 1000, //10 mins
	max: 50 // amount
})
app.use(limiter)
//Prevent http param pollutions
app.use(hpp())

//Morgan - HTTP request logger
app.use(morgan("dev"))

//Mount routers
app.use("/provider", provider)
app.use("/auth", auth)
app.use("/rental", rental)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log("Server running in", process.env.NODE_ENV, "mode on port", PORT))

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`)
	//Close server & exit process
	server.close(() => process.exit(1))
})
