'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Report  from "@/app/(main)/review/_components/report"
import { Feedback } from "@/app/(main)/review/_components/feedback"
import { useEffect, useState } from "react"
import Cookies from 'js-cookie';


interface PageProps {
    reviewData: any
    reviewInfo: any
    paymentStatus: any
}

export default function Review({ reviewData, reviewInfo, paymentStatus }: PageProps) {
  const [tab, setTab] = useState<string>('report');
  const [userType, setUserType] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);

  useEffect(() => {
    
    const value = Cookies.get('pracUserType');
    // console.log("ck",value)
    setUserType(value);

    if(paymentStatus.result == 'PAID' || reviewData.interviewType == 'Practice' || value == 'admin' ){
      setIsPaid(true)
    }
    // console.log("userType",userType)
    // console.log("isPaid",isPaid)
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
        <Tabs defaultValue="feedback" className="w-full" value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 grid w-full grid-cols-2 md:w-[400px] px-4 bg-white border border-gray-200">
            <TabsTrigger 
            value="report"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >Assessment Report</TabsTrigger>
            <TabsTrigger 
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
            value="feedback"
            >Personalized Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="report">
            <Report reviewData = {reviewData} onSetTab={setTab} />
          </TabsContent>
          <TabsContent value="feedback">
            <Feedback reviewData = {reviewData} reviewInfo={reviewInfo} paymentStatus={paymentStatus} isPaid={isPaid}/>
          </TabsContent>
        </Tabs>
  )
}
