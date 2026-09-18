'use client';

import { AlertDialog, Button, CloseButton } from '@heroui/react';

import { leaveGatheringAction } from '@/app/gatherings/actions';
import { useState } from 'react';

export default function LeaveGatheringButton({ gatheringId }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <AlertDialog.Trigger>
        <Button type="button" variant="danger-soft">
          모임 탈퇴
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>모임에서 탈퇴할까요?</AlertDialog.Heading>
              <CloseButton
                aria-label="모임 탈퇴 확인 닫기"
                className="absolute top-4 right-4"
                onPress={() => setIsOpen(false)}
              />
            </AlertDialog.Header>
            <AlertDialog.Body>
              탈퇴하면 이 모임의 멤버 전용 기능을 더 이상 사용할 수 없습니다.
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <form action={leaveGatheringAction}>
                <input type="hidden" name="gatheringId" value={gatheringId} />
                <Button type="submit" variant="danger">
                  탈퇴하기
                </Button>
              </form>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
