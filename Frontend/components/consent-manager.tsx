"use client";

import { useEffect, useState } from "react";
import { useBlockchainRegistry } from "@/hooks/use-blockchain-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
} from "lucide-react";

interface ConsentItem {
  provider: string;
  providerName?: string;
  specialty?: string;
  grantedAt: Date;
  expiresAt: Date | null;
  active: boolean;
}

interface providerInfo {
  providerAddress: string;
  providerName: string;
  specialty: string;
}

interface ConsentManagerProps {
  userId?: string;
  patientWalletAddress?: string;
}

export function ConsentManager({ userId, patientWalletAddress }: ConsentManagerProps) {
  const {
    grantConsent,
    revokeConsent,
    checkAccess,
    getProviders,
    getConsent,
    connected,
    address,
    loading,
  } = useBlockchainRegistry();
  const [providerAddress, setProviderAddress] = useState("");
  const [durationHours, setDurationHours] = useState("24");
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [providerInfo, setProviderInfo] = useState<providerInfo[]>([]);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      if (connected && address) {
        try {
          const providers = await getProviders();
          setProviderInfo(providers);

          const grantedConsents: ConsentItem[] = [];

          for (const provider of providers) {
            try {
              const consent = await getConsent(address, provider.providerAddress);
              if (consent.hasAccess) {
                grantedConsents.push({
                  provider: provider.providerAddress,
                  providerName: provider.providerName,
                  specialty: provider.specialty,
                  grantedAt: new Date(Number(consent.grantedAt) * 1000),
                  expiresAt:
                    Number(consent.expiresAt) === 0
                      ? null
                      : new Date(Number(consent.expiresAt) * 1000),
                  active: true,
                });
              }
            } catch (err: any) {
              console.error(`Error fetching consent for ${provider.providerAddress}:`, err);
            }
          }

          setConsents(grantedConsents);
        } catch (err: any) {
          console.error("Error fetching providers or consents:", err);
        }
      }
    };

    fetchProviders();
  }, [connected, address]);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !providerAddress ||
      !providerAddress.startsWith("0x") ||
      providerAddress.length !== 42
    ) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid EVM wallet address (0x...)",
      });
      return;
    }

    try {
      setGranting(true);
      setStatusMessage(null);

      const hours = parseInt(durationHours, 10) || 0;
      const expiryTimestamp =
        hours > 0 ? Math.floor(Date.now() / 1000) + hours * 3600 : 0;

      let grantHash: string | undefined;
      if (connected) {
        const result = await grantConsent(providerAddress, expiryTimestamp);
        grantHash = result.transactionHash;
      }

      const newConsent: ConsentItem = {
        provider: providerAddress,
        grantedAt: new Date(),
        expiresAt:
          hours > 0 ? new Date(Date.now() + hours * 3600 * 1000) : null,
        active: true,
      };

      setConsents((prev) => [
        newConsent,
        ...prev.filter(
          (c) => c.provider.toLowerCase() !== providerAddress.toLowerCase(),
        ),
      ]);
      setStatusMessage({
        type: "success",
        text: `Access granted to ${providerAddress.slice(0, 6)}...${providerAddress.slice(-4)} on-chain`,
      });
      setProviderAddress("");

       await fetch('/api/permissions/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: userId,
          patientWalletAddress: address,
          providerWalletAddress: providerAddress,
          expiresAt: expiryTimestamp ? new Date(expiryTimestamp * 1000).toISOString() : null,
          blockchainTxHash: grantHash,
        }),
      }).catch(err => {
        console.error('Failed to grant database permission:', err)
        // Don't throw error - blockchain consent was successful
      })

    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to grant access on blockchain",
      });
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (targetProvider: string) => {
    try {
      setStatusMessage(null);

      let revokeHash: string | undefined;
      if (connected) {
        const result = await revokeConsent(targetProvider);
        revokeHash = result.transactionHash;
      }
      setConsents((prev) =>
        prev.map((c) =>
          c.provider.toLowerCase() === targetProvider.toLowerCase()
            ? { ...c, active: false }
            : c,
        ),
      );
      setStatusMessage({
        type: "success",
        text: `Access revoked for ${targetProvider.slice(0, 6)}...${targetProvider.slice(-4)} on-chain`,
      });

       await fetch('/api/permissions/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: userId,
          patientWalletAddress: address,
          providerWalletAddress: targetProvider,
          blockchainTxHash: revokeHash,
        }),
      }).catch(err => {
        console.error('Failed to revoke database permission:', err)
        // Don't throw error - blockchain consent was successful
      })

    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to revoke consent on-chain",
      });
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Doctor Consent & Access Manager
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant or revoke cryptographic access permissions to your medical
                records on Flare Blockchain
              </p>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm border ${
              statusMessage.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleGrant} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="providerAddress">
                Doctor / Healthcare Provider Wallet Address
              </Label>
              <Input
                id="providerAddress"
                placeholder="0x1234...abcd"
                value={providerAddress}
                onChange={(e) => setProviderAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Access Duration (Hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                placeholder="24 (0 = Never expires)"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={granting || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <UserPlus size={16} />
            {granting
              ? "Recording Consent On-Chain..."
              : "Grant Access Permission"}
          </Button>
        </form>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Active Provider Consents ({consents.filter((c) => c.active).length})
          </h3>

          {consents.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg text-center">
              No active doctor permissions configured yet. Enter a doctor&apos;s
              wallet address above to share access securely.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
              {consents.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                        {item.provider}
                      </span>
                      {item.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                          <XCircle size={12} /> Revoked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Granted:{" "}
                        {item.grantedAt.toLocaleTimeString()}
                      </span>
                      {item.expiresAt ? (
                        <span>Expires: {item.expiresAt.toLocaleString()}</span>
                      ) : (
                        <span>No expiry</span>
                      )}
                    </div>
                  </div>

                  {item.active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(item.provider)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 border-rose-200 dark:border-rose-900"
                    >
                      <Trash2 size={14} className="mr-1" /> Revoke Access
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 mt-6">
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            List of Registered Doctors/Health Providers ({providerInfo.length})
          </h3>

          {providerInfo.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg text-center">
              No registered doctor/health providers. Come back later or reload.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
              {providerInfo?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20"
                >
                  <div className="space-y-1">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                        {item.providerName}
                      </p>
                      <p className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
                        {item.specialty}
                      </p>
                      <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                        {item.providerAddress}
                        <Copy
                          size={14}
                          className="inline-block ml-1 text-slate-500 dark:text-slate-400"
                          onClick={() => {
                            navigator.clipboard.writeText(item.providerAddress);
                            alert("Copied to clipboard!");
                          }}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
