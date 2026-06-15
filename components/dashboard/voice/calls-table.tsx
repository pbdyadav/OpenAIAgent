"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { PhoneCall, User, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CallsTable({ calls }: { calls: any[] }) {
  if (!calls || calls.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-xl bg-card">
        <PhoneCall className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No AI Voice Calls Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          When customers call your Twilio number, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Caller ID</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Extracted Lead</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow key={call.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-accent" />
                  {call.phone_number}
                </div>
              </TableCell>
              <TableCell>
                {call.duration ? `${call.duration} sec` : "Unknown"}
              </TableCell>
              <TableCell>
                {call.lead_name || call.lead_phone || call.lead_requirement ? (
                  <div className="space-y-1">
                    {call.lead_name && (
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {call.lead_name}
                      </div>
                    )}
                    {call.lead_requirement && (
                      <Badge variant="outline" className="bg-primary/5 text-xs text-primary mt-1">
                        {call.lead_requirement}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs italic">No lead extracted</span>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-[250px] truncate text-sm text-muted-foreground" title={call.call_summary}>
                  {call.call_summary || "No summary available"}
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
