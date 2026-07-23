"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Protected from "@/components/Protected";
import { api } from "@/lib/api";

export default function Player() {
  const { id } = useParams<{ id: string }>(); const video = useRef<HTMLVideoElement>(null); const [source, setSource] = useState<{ media: string; captions: string } | null>(null); const [error, setError] = useState(""); const [playing, setPlaying] = useState(false); const [captions, setCaptions] = useState(false);
  useEffect(() => { api<{ media: string; captions: string }>(`/playback/${id}`, { method: "POST" }).then(setSource).catch(reason => setError(reason.message)); }, [id]);
  function toggle() { if (!video.current) return; video.current.paused ? video.current.play() : video.current.pause(); }
  return <Protected><main className="player-page">{error ? <div className="player-error"><p className="eyebrow">PLAYBACK BLOCKED</p><h1>We can&apos;t start this story.</h1><p>{error}</p><Link className="button" href={`/title/${id}`}>Back to details</Link></div> : source ? <><video ref={video} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onClick={toggle} aria-label="StreamForge simulated player"><source src={source.media} type="video/mp4" /><track src={source.captions} kind="captions" srcLang="en" label="English" default={captions} /></video><div className="player-overlay"><Link className="close-player" href={`/title/${id}`} aria-label="Close player">×</Link><div className="player-title"><span>NOW PLAYING</span><strong>StreamForge Original</strong></div><div className="controls"><button onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? "Ⅱ" : "▶"}</button><label className="seek-label">Progress<input type="range" min="0" max={video.current?.duration || 30} defaultValue="0" onChange={event => { if (video.current) video.current.currentTime = Number(event.target.value); }} /></label><button aria-pressed={captions} onClick={() => { setCaptions(!captions); if (video.current?.textTracks[0]) video.current.textTracks[0].mode = captions ? "hidden" : "showing"; }}>CC</button><label className="volume-label">Volume<input type="range" min="0" max="1" step="0.1" defaultValue="1" onChange={event => { if (video.current) video.current.volume = Number(event.target.value); }} /></label></div></div></> : <div className="loader" />}</main></Protected>;
}
