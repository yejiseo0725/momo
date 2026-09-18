'use client';

import { Button, Modal } from '@heroui/react';

import ChallengeForm from '@/app/gatherings/[id]/challenges/ChallengeForm';
import { deleteChallengeAction } from '@/app/gatherings/[id]/challenges/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ChallengeEditModal({ challenge, gatheringId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleSuccess() {
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" onPress={() => setIsOpen(true)}>
        챌린지 수정
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>챌린지 수정</Modal.Heading>
                <Modal.CloseTrigger
                  aria-label="챌린지 수정 닫기"
                  onPress={() => setIsOpen(false)}
                  onClick={() => setIsOpen(false)}
                />
              </Modal.Header>
              <Modal.Body>
                <ChallengeForm
                  challengeId={challenge.id}
                  gatheringId={gatheringId}
                  initialValues={challenge}
                  mode="edit"
                  onSuccess={handleSuccess}
                  actionButtons={({ pending }) => (
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <form action={deleteChallengeAction}>
                        <input
                          type="hidden"
                          name="gatheringId"
                          value={gatheringId}
                        />
                        <input
                          type="hidden"
                          name="challengeId"
                          value={challenge.id}
                        />
                        <Button type="submit" variant="danger">
                          챌린지 삭제
                        </Button>
                      </form>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onPress={() => setIsOpen(false)}
                        >
                          취소
                        </Button>
                        <Button
                          type="submit"
                          isDisabled={pending}
                          isPending={pending}
                        >
                          {pending ? '저장하는 중...' : '수정 완료'}
                        </Button>
                      </div>
                    </div>
                  )}
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
