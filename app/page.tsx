"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, FileText } from "lucide-react"
import { toast } from "sonner"

const errorCodes = [
  {
    code: "wells_fargo_rtp/1071-066",
    description: "The participants status is inactive. Please contact your creditors bank for assistance.",
  },
  { 
    code: "checkout_card/400", 
    description: "payment_type_not_supported" 
  },
  { 
    code: "checkout_card/400", 
    description: "token_used" 
  },
  { 
    code: "checkout_card/400", 
    description: "visa_scheme_not_configured" 
  },
  { 
    code: "checkout_card/400", 
    description: "mastercard_scheme_not_configured" 
  },
  { 
    code: "checkout_card/400", 
    description: "card_not_supported_domestic_non_money_transfer" 
  },
  { 
    code: "wells_fargo_card/1009-106", 
    description: "Invalid data. There may be a problem with your token or account setup." 
  },
  { 
    code: "wells_fargo_card/connection_failure", 
    description: "Failed to connect to Wells Fargo service." 
  },
  {
    code: "wells_fargo_card/1009-527",
    description: "Payment status is pending. Do not retry. For final payment status, please contact your Client Service Officer for assistance.",
  },
  { 
    code: "galileo_dda_process_response_task/internal_error", 
    description: "Galileo response with internal error" 
  },
  { 
    code: "wealth/failure", 
    description: "wealth generic error" 
  },
  { 
    code: "wealth/connection_failure", 
    description: "Failed to connect to wealth service." 
  },
  { 
    code: "payment_platform/internal_error", 
    description: "Internal server error" 
  },
]


export default function TSVPayloadConverter() {
  const [tsvInput, setTsvInput] = useState("")
  const [status, setStatus] = useState<"SUCCESS" | "ERROR">("SUCCESS")
  const [selectedError, setSelectedError] = useState("")
  const [generatedPayload, setGeneratedPayload] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-pulse" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-bounce" />
      </div>
    </div>
  )

  const processTSV = async () => {
    if (!tsvInput.trim()) {
      toast.error("Please enter TSV data")
      return
    }

    setIsProcessing(true)

    // Simulate processing time for skeleton loading
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const lines = tsvInput.trim().split("\n").filter(line => line.trim() !== "")
      const transfers = []

      console.log("Processing input lines:", lines)

      for (const line of lines) {
        // Try tab separation first, then space separation
        let parts = line.split("\t")
        if (parts.length < 2) {
          parts = line.split(/\s+/) // Split on any whitespace (spaces, tabs, etc.)
        }
        
        console.log("Line:", line, "Parts:", parts)
        
        if (parts.length >= 2) {
          const transferId = parts[0]?.trim()
          const stepId = parts[1]?.trim()
          
          if (transferId && stepId) {
            const transfer: any = {
              id: transferId,
              stepId: stepId,
              status: status === "SUCCESS" ? "SETTLED" : "ERROR",
            }

            // Add error details if ERROR status is selected
            if (status === "ERROR") {
              if (selectedError !== "") {
                const selectedIndex = parseInt(selectedError)
                const errorCode = errorCodes[selectedIndex]
                
                if (errorCode) {
                  transfer.resultCode = errorCode.code
                  transfer.resultDescription = errorCode.description
                } else {
                  // Fallback if invalid error code index
                  transfer.resultCode = "generic_error"
                  transfer.resultDescription = "An error occurred during processing"
                }
              } else {
                // Require error code selection for ERROR status
                toast.error("Please select an error code for ERROR status")
                return
              }
            }

            transfers.push(transfer)
            console.log("Added transfer:", transfer)
          }
        } else {
          console.log("Skipping line with insufficient parts:", line, parts)
        }
      }

      console.log("Final transfers:", transfers)

      if (transfers.length === 0) {
        toast.error("No valid transfer data found. Please check your format (transfer_id [TAB or SPACE] step_id)")
        return
      }

      const payload = {
        skipTerminalStatusCheck: false,
        requests: transfers,
      }

      console.log("Generated payload:", payload)
      setGeneratedPayload(JSON.stringify(payload, null, 2))
      toast.success(`Generated payload for ${transfers.length} transfer${transfers.length > 1 ? 's' : ''}`)
    } catch (error) {
      console.error("Error processing TSV:", error)
      toast.error("Failed to process TSV data. Please check the format.")
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPayload)
      toast.success("Payload copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-gray-200/50 backdrop-blur-sm bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-semibold">TSV to JSON Payload Converter</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Convert TSV data to PP Toolkit JSON payload format</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="backdrop-blur-sm bg-white/90 border-white/20">
            <CardHeader>
              <CardTitle>Input Configuration</CardTitle>
              <CardDescription>Enter your TSV data with transfer IDs and step IDs (tab-separated)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tsv-input">TSV Data</Label>
                <Textarea
                  id="tsv-input"
                  placeholder="IC-795c1bf6-6141-457e-a284-69900c862bcc 1e33e4ab-cdc2-486a-b393-512bc60bbf24&#10;
                  IC-78c9592e-0bff-4c20-bda7-df0411314dca 1faa1411-a282-4179-9f45-5450bf427bd1&#10;
                  IC-b1a3944a-c450-4d67-97f3-7b2c06dfdb2e 9283df5c-47d9-4283-a7fb-1c7f1b511a17"
                  value={tsvInput}
                  onChange={(e) => setTsvInput(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Format: Each line should contain transfer_id and step_id separated by tab or space
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setTsvInput("IC-795c1bf6-6141-457e-a284-69900c862bcc 1e33e4ab-cdc2-486a-b393-512bc60bbf24\nIC-78c9592e-0bff-4c20-bda7-df0411314dca 1faa1411-a282-4179-9f45-5450bf427bd1\nIC-b1a3944a-c450-4d67-97f3-7b2c06dfdb2e 9283df5c-47d9-4283-a7fb-1c7f1b511a17")}
                    className="text-xs h-6"
                  >
                    Load Sample
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Transfer Status</Label>
                <RadioGroup value={status} onValueChange={(value: "SUCCESS" | "ERROR") => setStatus(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SUCCESS" id="success" />
                    <Label htmlFor="success">SUCCESS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ERROR" id="error" />
                    <Label htmlFor="error">ERROR</Label>
                  </div>
                </RadioGroup>
              </div>

              {status === "ERROR" && (
                <div className="space-y-2">
                  <Label htmlFor="error-code">Error Code</Label>
                  <Select value={selectedError} onValueChange={setSelectedError}>
                    <SelectTrigger className="w-full min-h-[60px] p-3">
                      <SelectValue placeholder="Select an error code">
                        {selectedError && (() => {
                          const selectedIndex = parseInt(selectedError)
                          const selected = errorCodes[selectedIndex]
                          return selected ? (
                            <div className="flex flex-col items-start text-left truncate w-full">
                              <span className="font-mono text-sm truncate w-full font-medium">{selected.code}</span>
                              <span className="text-xs text-muted-foreground truncate w-full mt-1">
                                {selected.description.length > 45 
                                  ? selected.description.substring(0, 45) + "..." 
                                  : selected.description}
                              </span>
                            </div>
                          ) : null
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-[300px] overflow-y-auto w-full">
                      {errorCodes.map((error, index) => (
                        <SelectItem key={index} value={index.toString()} className="bg-white hover:bg-gray-50 cursor-pointer p-3 focus:bg-blue-50 focus:outline-none">
                          <div className="flex flex-col w-full min-w-0 space-y-2">
                            <span className="font-mono text-sm font-medium break-all text-gray-900">{error.code}</span>
                            <span className="text-xs text-muted-foreground break-words whitespace-normal leading-relaxed">
                              {error.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={processTSV} className="w-full" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Generate Payload"}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="backdrop-blur-sm bg-white/90 border-white/20">
            <CardHeader>
              <CardTitle>Generated Payload</CardTitle>
              <CardDescription>Copy the generated JSON payload for PP Toolkit</CardDescription>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-4 w-2/4" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              ) : generatedPayload ? (
                <div className="space-y-4">
                  <div className="relative">
                    <pre className="bg-muted/50 p-4 rounded-lg text-sm font-mono overflow-auto max-h-[400px] border backdrop-blur-sm">
                      {generatedPayload}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Generated payload will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
