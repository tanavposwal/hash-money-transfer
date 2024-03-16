import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import * as crypto from 'crypto';

export const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function hashMe(target: string): string {
    const hash = crypto.createHash('sha256');
    return hash.update(target).digest('hex')
}

let users: {
    id: string,
    balance: number
}[] = [
    {
        id: "1212",
        balance: 200
    },
    {
        id: "1352",
        balance: 320
    }
]

let middleBank: {
    id: string,
    amount: number,
    hashprivate: string,
    hashpublic: string,
}[] = []

app.get("/users", (req: Request, res: Response) => {
    res.json(users)
})

app.get("/mb", (req: Request, res: Response) => {
    res.json(middleBank)
})

app.post("/initpayment", (req: Request, res: Response) => {
    // in future dont ask for "from" detect by auth token
    const { from, to, amount }: {from: string, to: string, amount: number} = req.body;
    const hashprivate: string = hashMe(amount+to)
    const hashpublic: string = hashMe(from+to)

    const senderindex = users.findIndex(item => item.id === from);
    users[senderindex] = { ...users[senderindex], balance: users[senderindex].balance-amount };
    middleBank.push({
        id: from,
        amount: amount,
        hashprivate: hashprivate,
        hashpublic: hashpublic
    })
    res.json({
        msg: "to complete transaction enter hash on ",
        hash: hashpublic
    })
})

app.post("/completepayment", (req: Request, res: Response) => {
    const user: any = req.headers["id"]!;
    const sender: any = req.headers["senderid"]!;
    const hashprivate: any = req.headers["hash"]
    const hashtemp: string = hashMe(sender+user)

    const block = middleBank.find(item => item.hashpublic === hashprivate)
    if (block?.hashpublic == hashtemp) {

        const receiverindex = users.findIndex(item => item.id === user);
        const blockAmount = middleBank.find(item => item.hashpublic === hashprivate)!;
        
        users[receiverindex] = { ...users[receiverindex], balance: users[receiverindex].balance+blockAmount.amount };
        
        middleBank = middleBank.filter(item => item.hashpublic !== hashprivate);
        res.json({msg: `payment from ${sender} to ${user} is completed.`})
    } else {
        res.json({msg: "payment failed"})
    }
})

app.listen(3000, () => console.log("listening on port http://localhost:3000/"))
