import { cn } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  ShoppingCart,
  ReceiptText,
  FileSignature,
  BadgeCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type DataCategory = {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  accepts: string;
  hint: string;
};

const DATA_CATEGORIES: DataCategory[] = [
  {
    id: "contracts",
    label: "Contracts",
    subtitle: "Sales + spend",
    description: "Supplier contracts, pricing tiers, rebate structures, and spend agreements",
    icon: FileSignature,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    accepts: ".pdf,.csv,.xlsx,.xls",
    hint: "PDF, CSV, or Excel",
  },
  {
    id: "sales",
    label: "Sales Data",
    subtitle: "AR invoices, lines",
    description: "Accounts receivable invoices and line-item sales records for matching",
    icon: ShoppingCart,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    accepts: ".csv,.xlsx,.xls",
    hint: "CSV or Excel",
  },
  {
    id: "supplier_ap",
    label: "Supplier AP",
    subtitle: "Costs and credits",
    description: "Supplier accounts payable — cost records, credit memos, and deductions",
    icon: ReceiptText,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    accepts: ".csv,.xlsx,.xls",
    hint: "CSV or Excel",
  },
  {
    id: "claim_outcomes",
    label: "Claim Outcomes",
    subtitle: "Paid, denied, aged",
    description: "Historical claim resolutions — paid amounts, denial reasons, and aged items",
    icon: BadgeCheck,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    accepts: ".csv,.xlsx,.xls,.pdf",
    hint: "CSV, Excel, or PDF",
  },
];

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  category: string;
  status: "processing" | "done" | "error";
  progress: number;
  uploadedAt: Date;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return FileText;
  if (ext === "csv" || ext === "xlsx" || ext === "xls") return FileSpreadsheet;
  return File;
}

function UploadZone({
  category,
  onFilesSelected,
}: {
  category: DataCategory;
  onFilesSelected: (files: File[], categoryId: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFilesSelected(files, category.id);
    },
    [category.id, onFilesSelected]
  );

  return (
    <div
      className={cn(
        "border rounded-xl p-4 transition-all duration-200 cursor-pointer",
        category.bgColor,
        dragging ? "scale-[1.01]" : ""
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={category.accepts}
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFilesSelected(files, category.id);
          e.target.value = "";
        }}
      />
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-black/20 shrink-0">
          <category.icon className={cn("h-5 w-5", category.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
            <span className="text-xs text-muted-foreground">— {category.subtitle}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{category.description}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              <Upload className={cn("h-3.5 w-3.5", category.color)} />
              <span className={cn("text-xs font-medium", category.color)}>
                {dragging ? "Drop to upload" : "Click or drag & drop"}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
              {category.hint}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileRow({ file, onRemove }: { file: UploadedFile; onRemove: (id: string) => void }) {
  const Icon = getFileIcon(file.name);
  const category = DATA_CATEGORIES.find((c) => c.id === file.category);

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-card/50 border border-border">
      <div className="p-2 rounded-lg bg-card shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
          {category && (
            <Badge variant="outline" className={cn("text-[10px] border-opacity-40", category.color)}>
              {category.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
          {file.status === "processing" && (
            <div className="flex items-center gap-2 flex-1">
              <Progress value={file.progress} className="h-1 flex-1 max-w-[120px]" />
              <span className="text-xs text-muted-foreground">{file.progress}%</span>
            </div>
          )}
          {file.status === "done" && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Ready
            </span>
          )}
          {file.status === "error" && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Failed
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {file.uploadedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
        onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default function Integrations() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFilesSelected = useCallback((files: File[], categoryId: string) => {
    const newFiles: UploadedFile[] = files.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      category: categoryId,
      status: "processing",
      progress: 0,
      uploadedAt: new Date(),
    }));

    setUploadedFiles((prev) => [...newFiles, ...prev]);

    newFiles.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress >= 100) {
          clearInterval(interval);
          setUploadedFiles((prev) =>
            prev.map((f) => f.id === file.id ? { ...f, progress: 100, status: "done" } : f)
          );
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => f.id === file.id ? { ...f, progress } : f)
          );
        }
      }, 300);
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const doneCount = uploadedFiles.filter((f) => f.status === "done").length;
  const processingCount = uploadedFiles.filter((f) => f.status === "processing").length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Data Import</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your source files — contracts, sales data, supplier AP, and claim outcomes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Files Uploaded</p>
            <p className="text-2xl font-bold text-foreground mt-1">{uploadedFiles.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Ready to Process</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{doneCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Processing</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{processingCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Upload by Input Type
          </h2>
          <div className="space-y-3">
            {DATA_CATEGORIES.map((category) => (
              <UploadZone key={category.id} category={category} onFilesSelected={handleFilesSelected} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Uploaded Files
          </h2>
          {uploadedFiles.length === 0 ? (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                <Upload className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Use the upload zones on the left to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <FileRow key={file.id} file={file} onRemove={handleRemove} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
