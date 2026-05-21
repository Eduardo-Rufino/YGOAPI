'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { galeraService, UserGalera } from '@/features/galeras/galeraService';
import { contestService, Contest, ContestDetail, Banlist } from '@/features/galeras/contestService';
import { authService } from '@/features/auth/authService';
import styles from '@/features/galeras/Galera.module.css';

const CONTEST_TYPE_LABEL: Record<number, string> = {
  0: 'Round Robin',
  1: 'Torneio',
};

const STAGE_LABEL: Record<number, string> = {
  0: 'Grupos',
  1: 'Oitavas',
  2: 'Quartas',
  3: 'Semifinal',
  4: 'Final',
};

export default function ManageGaleraPage() {
  const [members, setMembers] = useState<UserGalera[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: number; username: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeGaleraId, setActiveGaleraId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Contests state
  const [contests, setContests] = useState<Contest[]>([]);
  const [expandedContestId, setExpandedContestId] = useState<number | null>(null);
  const [contestDetail, setContestDetail] = useState<ContestDetail | null>(null);
  const [contestLoading, setContestLoading] = useState(false);
  const [winnerLoading, setWinnerLoading] = useState<number | null>(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState<number | null>(null);

  const [finishingContestId, setFinishingContestId] = useState<number | null>(null);
  const [selectedWinnerId, setSelectedWinnerId] = useState<number | ''>('');

  // Create Contest state
  const [banlists, setBanlists] = useState<Banlist[]>([]);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [newContestName, setNewContestName] = useState('');
  const [newContestBanlistId, setNewContestBanlistId] = useState<number | null>(null);
  const [newContestType, setNewContestType] = useState<number>(0);

  // Mapeamento userId -> username para exibir nomes nas partidas
  const memberMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    members.forEach((m) => {
      map[m.userId] = m.username;
    });
    return map;
  }, [members]);

  const fetchMembers = useCallback(async (id: number) => {
    setLoading(true);
    const data = await galeraService.getGaleraMembers(id);
    setMembers(data);
    setLoading(false);
  }, []);

  const fetchContests = useCallback(async (id: number) => {
    const data = await contestService.getByGaleraId(id);
    setContests(data);
  }, []);

  useEffect(() => {
    const user = authService.getUser();
    setIsAdmin(user?.role === 'Admin' || user?.role === 'ADMIN');

    const loadBanlists = async () => {
      const lists = await contestService.getBanlists();
      setBanlists(lists);
    };
    loadBanlists();

    const id = galeraService.getActiveGaleraId();
    setActiveGaleraId(id);
    if (id) {
      fetchMembers(id);
      fetchContests(id);
    }

    const handleGaleraChange = () => {
      const newId = galeraService.getActiveGaleraId();
      setActiveGaleraId(newId);
      if (newId) {
        fetchMembers(newId);
        fetchContests(newId);
      } else {
        setMembers([]);
        setContests([]);
      }
      setMessage(null);
      setExpandedContestId(null);
      setContestDetail(null);
    };
    window.addEventListener('active-galera-changed', handleGaleraChange);
    return () => window.removeEventListener('active-galera-changed', handleGaleraChange);
  }, [fetchMembers, fetchContests]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const results = await galeraService.searchUsers(searchQuery);
    setSearchResults(results);
    setLoading(false);
  };

  const handleAdd = async (userId: number) => {
    if (!activeGaleraId) return;
    setLoading(true);
    try {
      await galeraService.addMembers(activeGaleraId, [userId]);
      setMessage({ text: 'Membro adicionado com sucesso!', type: 'success' });
      await fetchMembers(activeGaleraId);
      setSearchResults([]);
      setSearchQuery('');
    } catch {
      setMessage({ text: 'Erro ao adicionar membro.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRemove = async (userId: number) => {
    if (!activeGaleraId) return;
    if (!confirm('Tem certeza que deseja remover este membro da galera?')) return;
    setLoading(true);
    try {
      await galeraService.removeMember(activeGaleraId, userId);
      setMessage({ text: 'Membro removido com sucesso!', type: 'success' });
      await fetchMembers(activeGaleraId);
    } catch {
      setMessage({ text: 'Erro ao remover membro.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleToggleContest = async (contestId: number) => {
    if (expandedContestId === contestId) {
      setExpandedContestId(null);
      setContestDetail(null);
      return;
    }
    setContestLoading(true);
    setExpandedContestId(contestId);
    setContestDetail(null);
    const detail = await contestService.getContestDetail(contestId);
    setContestDetail(detail);
    setContestLoading(false);
  };

  const handleSetWinner = async (matchId: number, winnerUserId: number) => {
    setWinnerLoading(matchId);
    try {
      await contestService.setMatchWinner(matchId, winnerUserId);
      // Recarrega o detalhe do contest para atualizar vencedores
      if (expandedContestId) {
        const detail = await contestService.getContestDetail(expandedContestId);
        setContestDetail(detail);
      }
      setMessage({ text: 'Vencedor definido com sucesso!', type: 'success' });
      // Atualiza pontos exibidos nos membros
      if (activeGaleraId) fetchMembers(activeGaleraId);
    } catch {
      setMessage({ text: 'Erro ao definir vencedor.', type: 'error' });
    } finally {
      setWinnerLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCreateContest = async () => {
    if (!activeGaleraId) return;
    if (!newContestName.trim()) {
      setMessage({ text: 'O nome da competição é obrigatório.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await contestService.createContest({
        galeraId: activeGaleraId,
        name: newContestName,
        banlistId: newContestBanlistId || null,
        type: newContestType
      });
      setMessage({ text: 'Competição criada com sucesso!', type: 'success' });
      setShowCreateContest(false);
      setNewContestName('');
      setNewContestBanlistId(null);
      setNewContestType(0);
      await fetchContests(activeGaleraId);
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao criar competição.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleFinishContest = async (contestId: number) => {
    if (!selectedWinnerId) {
      setMessage({ text: 'Selecione um vencedor para encerrar a competição.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await contestService.finishContest(contestId, Number(selectedWinnerId));
      setMessage({ text: 'Competição encerrada com sucesso!', type: 'success' });
      setFinishingContestId(null);
      setSelectedWinnerId('');
      if (activeGaleraId) await fetchContests(activeGaleraId);
      if (expandedContestId === contestId) {
        const detail = await contestService.getContestDetail(contestId);
        setContestDetail(detail);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Erro ao encerrar competição.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const alertStyle = (type: 'success' | 'error') => ({
    border: `1px solid ${type === 'success' ? '#10B981' : '#EF4444'}`,
    color: type === 'success' ? '#10B981' : '#EF4444',
    background: type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    marginBottom: '1.5rem',
  });

  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.title}>Minha Galera</h1>
        <p className={styles.subtitle}>Veja os membros e competições do seu grupo.</p>
      </header>

      <div className={styles.card}>
        {!activeGaleraId ? (
          <div
            className={styles.alert}
            style={{ border: '1px solid #FCD34D', color: '#FCD34D', background: 'rgba(252, 211, 77, 0.1)' }}
          >
            Nenhuma Galera Ativa selecionada. Selecione uma na barra de navegação superior para gerenciar.
          </div>
        ) : (
          <>
            {message && (
              <div className={styles.alert} style={alertStyle(message.type)}>
                {message.text}
              </div>
            )}

            {/* ── Membros ── */}
            <div className={styles.sectionTitle}>👥 Membros Atuais</div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Usuário</th>
                    <th className={styles.th}>Pontos de Duelo</th>
                    {isAdmin && (
                      <th className={styles.th} style={{ textAlign: 'right' }}>
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.userId}>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(138, 43, 226, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                            }}
                          >
                            {member.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className={styles.userName}>{member.username}</span>
                        </div>
                      </td>
                      <td className={styles.td}>{member.duelPoints} pts</td>
                      {isAdmin && (
                        <td className={styles.td} style={{ textAlign: 'right' }}>
                          <button
                            className={styles.btnDanger}
                            onClick={() => handleRemove(member.userId)}
                            disabled={loading}
                          >
                            Remover
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {members.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={isAdmin ? 3 : 2}
                        className={styles.td}
                        style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}
                      >
                        Nenhum membro encontrado nesta galera.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Adicionar Membro (apenas Admin) ── */}
            {isAdmin && (
              <div className={styles.addSection}>
                <div className={styles.sectionTitle}>➕ Adicionar Novo Membro</div>

                <div
                  className={styles.inputGroup}
                  style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '1rem' }}
                >
                  <div style={{ flex: 1 }}>
                    <label>Buscar por nome de usuário</label>
                    <input
                      className={styles.input}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ex: yugi_muto..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    className={styles.btnSubmit}
                    onClick={handleSearch}
                    disabled={loading}
                    style={{ width: 'auto', padding: '0.75rem 2rem' }}
                  >
                    {loading ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      background: 'rgba(15, 23, 42, 0.4)',
                      borderRadius: '8px',
                      padding: '1rem',
                    }}
                  >
                    <ul className={styles.list}>
                      {searchResults.map((user) => (
                        <li
                          key={user.id}
                          className={styles.listItem}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 0,
                          }}
                        >
                          <span className={styles.userName}>{user.username}</span>
                          <button
                            className={styles.btnSubmit}
                            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                            onClick={() => handleAdd(user.id)}
                            disabled={loading}
                          >
                            Adicionar à Galera
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Competições ── */}
            <div className={styles.contestSection}>
              <div className={styles.sectionTitle} style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏆 Competições
                </div>
                {isAdmin && (
                  <button 
                    className={styles.btnToggleForm}
                    onClick={() => setShowCreateContest(!showCreateContest)}
                  >
                    {showCreateContest ? 'Cancelar' : 'Criar nova competição'}
                  </button>
                )}
              </div>

              {showCreateContest && (
                <div className={styles.createContestForm}>
                  <div className={styles.createContestHeader}>
                    <h3 style={{ margin: 0, color: '#ADEBB3' }}>Nova Competição</h3>
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label>Nome da Competição</label>
                    <input 
                      className={styles.input} 
                      value={newContestName}
                      onChange={e => setNewContestName(e.target.value)}
                      placeholder="Ex: Torneio de Inverno"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className={styles.inputGroup} style={{ flex: 1, minWidth: '200px' }}>
                      <label>Banlist (Opcional)</label>
                      <select 
                        className={styles.selectInput}
                        value={newContestBanlistId || ''}
                        onChange={e => setNewContestBanlistId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">-- Sem Banlist --</option>
                        {banlists.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup} style={{ flex: 1, minWidth: '200px' }}>
                      <label>Tipo</label>
                      <select 
                        className={styles.selectInput}
                        value={newContestType}
                        onChange={e => setNewContestType(Number(e.target.value))}
                      >
                        <option value={0}>Round Robin (Todos contra todos)</option>
                        <option value={1}>Torneio (Mata-mata)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    className={styles.btnSubmit}
                    onClick={handleCreateContest}
                    disabled={loading}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {loading ? 'Criando...' : 'Confirmar e Criar'}
                  </button>
                </div>
              )}

              {contests.length === 0 ? (
                <div className={styles.emptyState}>Nenhuma competição encontrada para esta galera.</div>
              ) : (
                <div className={styles.contestList}>
                  {contests.map((contest) => {
                    const isExpanded = expandedContestId === contest.id;
                    return (
                      <div key={contest.id} className={styles.contestCard}>
                        {/* Header do contest */}
                        <button
                          className={styles.contestHeader}
                          onClick={() => handleToggleContest(contest.id)}
                        >
                          <div className={styles.contestHeaderLeft}>
                            <span className={styles.contestName}>{contest.name}</span>
                            <div className={styles.contestBadges}>
                              <span className={styles.badge}>
                                {CONTEST_TYPE_LABEL[contest.type] ?? 'Desconhecido'}
                              </span>
                              <span
                                className={styles.badge}
                                style={{
                                  background: contest.isFinished
                                    ? 'rgba(16,185,129,0.2)'
                                    : 'rgba(251,191,36,0.2)',
                                  color: contest.isFinished ? '#10B981' : '#FBBF24',
                                  border: `1px solid ${contest.isFinished ? '#10B981' : '#FBBF24'}`,
                                }}
                              >
                                {contest.isFinished ? '✅ Finalizado' : '⚔️ Em andamento'}
                              </span>
                            </div>
                          </div>
                          <span className={styles.contestChevron}>{isExpanded ? '▲' : '▼'}</span>
                        </button>

                        {/* Detalhe expandido */}
                        {isExpanded && (
                          <div className={styles.contestBody}>
                            {contestLoading ? (
                              <div className={styles.emptyState}>Carregando partidas...</div>
                            ) : !contestDetail ? (
                              <div className={styles.emptyState}>Não foi possível carregar os detalhes.</div>
                            ) : contestDetail.matches.length === 0 ? (
                              <div className={styles.emptyState}>Nenhuma partida cadastrada.</div>
                            ) : (
                              <div className={styles.playerGroupsContainer}>
                                {!contestDetail.contest.isFinished && contestDetail.contest.type === 0 && isAdmin && (
                                  <div style={{ marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#ADEBB3' }}>Encerrar Competição</h4>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                      <div style={{ flex: 1, minWidth: '200px' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#E2E8F0', display: 'block', marginBottom: '0.25rem' }}>Selecione o Vencedor Final</label>
                                        <select 
                                          className={styles.selectInput} 
                                          value={finishingContestId === contest.id ? selectedWinnerId : ''}
                                          onChange={e => {
                                            setFinishingContestId(contest.id);
                                            setSelectedWinnerId(e.target.value ? Number(e.target.value) : '');
                                          }}
                                        >
                                          <option value="">-- Selecionar --</option>
                                          {members.map(m => (
                                            <option key={m.userId} value={m.userId}>{m.username}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <button 
                                        className={styles.btnDanger}
                                        onClick={() => handleFinishContest(contest.id)}
                                        disabled={loading || finishingContestId !== contest.id || selectedWinnerId === ''}
                                      >
                                        {loading && finishingContestId === contest.id ? 'Encerrando...' : 'Encerrar'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {Array.from(new Set(contestDetail.matches.flatMap(m => m.player2Id ? [m.player1Id, m.player2Id] : [m.player1Id]))).map(playerId => {
                                  const playerMatches = contestDetail.matches.filter(m => m.player1Id === playerId || m.player2Id === playerId);
                                  const playerName = memberMap[playerId] ?? `#${playerId}`;
                                  const isExpandedPlayer = expandedPlayerId === playerId;
                                  
                                  return (
                                    <div key={playerId} className={styles.playerGroup}>
                                      <button 
                                        className={styles.playerGroupHeader}
                                        onClick={() => setExpandedPlayerId(isExpandedPlayer ? null : playerId)}
                                      >
                                        <div className={styles.playerGroupName}>
                                          <div
                                            style={{
                                              width: '24px', height: '24px', borderRadius: '50%',
                                              background: 'rgba(138, 43, 226, 0.4)',
                                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                                              fontSize: '0.7rem'
                                            }}
                                          >
                                            {playerName.substring(0, 2).toUpperCase()}
                                          </div>
                                          {playerName} ({playerMatches.length} partidas)
                                        </div>
                                        <span className={styles.contestChevron}>{isExpandedPlayer ? '▲' : '▼'}</span>
                                      </button>
                                      
                                      {isExpandedPlayer && (
                                        <div className={styles.playerGroupBody}>
                                          <div className={styles.tableContainer} style={{ marginTop: 0 }}>
                                            <table className={styles.table}>
                                              <thead>
                                                <tr>
                                                  <th className={styles.th}>Fase</th>
                                                  <th className={styles.th}>Adversário</th>
                                                  <th className={styles.th}>Vencedor</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {playerMatches.map(match => {
                                                  const isPlayer1 = match.player1Id === playerId;
                                                  const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
                                                  const opponentName = opponentId ? (memberMap[opponentId] ?? `#${opponentId}`) : '—';
                                                  const currentWinnerName = match.winnerId ? (memberMap[match.winnerId] ?? `#${match.winnerId}`) : null;
                                                  
                                                  return (
                                                    <tr key={match.id}>
                                                      <td className={styles.td}>{STAGE_LABEL[match.stage] ?? `Fase ${match.stage}`}</td>
                                                      <td className={styles.td}>{opponentName}</td>
                                                      <td className={styles.td}>
                                                        {contestDetail.contest.isFinished ? (
                                                          <span style={{ color: currentWinnerName ? '#10B981' : '#94A3B8', fontWeight: currentWinnerName ? 700 : 400 }}>
                                                            {currentWinnerName ?? '—'}
                                                          </span>
                                                        ) : (
                                                          <select
                                                            className={styles.winnerSelect}
                                                            value={match.winnerId ?? ''}
                                                            disabled={!match.player2Id || winnerLoading === match.id}
                                                            onChange={(e) => {
                                                              const val = e.target.value;
                                                              if (val) handleSetWinner(match.id, Number(val));
                                                            }}
                                                          >
                                                            <option value="">{winnerLoading === match.id ? 'Salvando...' : '— Selecionar —'}</option>
                                                            <option value={playerId}>{playerName}</option>
                                                            {opponentId && <option value={opponentId}>{opponentName}</option>}
                                                          </select>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
